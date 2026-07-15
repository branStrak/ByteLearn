const Query = require('../model/Query');
const Course = require('../model/Course');
const Lesson = require('../model/Lesson');


const createQuery = async (req, res) => {
  try {
    const { courseId, lessonId, question } = req.body;
    const studentId = req.user._id;

    if (!courseId || !question) {
      return res.status(400).json({ success: false, message: "Course ID and Question are required" });
    }

    const query = await Query.create({
      studentId,
      courseId,
      lessonId,
      question
    });

    res.status(201).json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getStudentQueries = async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = { studentId: req.user._id };

    if (courseId) filter.courseId = courseId;

    const queries = await Query.find(filter)
      .populate('courseId', 'title')
      .populate('lessonId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEducatorQueries = async (req, res) => {
  try {
    const { status, courseId } = req.query;
    const educatorId = req.user._id;

    // Find courses where educator is owner OR co-instructor
    const educatorCourses = await Course.find({
      $or: [
        { educatorId },
        { 'coInstructors.userId': educatorId }
      ]
    }, '_id');
    const courseIds = educatorCourses.map(c => c._id);

    const filter = { courseId: { $in: courseIds } };
    if (status) filter.status = status;
    if (courseId) filter.courseId = courseId;

    const queries = await Query.find(filter)
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .populate('lessonId', 'title')
      .populate('repliedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const generateAIDrafts = async (req, res) => {
  try {
    const queryId = req.params.id || req.params.queryId;
    const query = await Query.findById(queryId)
      .populate('studentId', 'name')
      .populate('courseId', 'title educatorId coInstructors');

    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    // Security check — owner OR co-instructor
    const userId = req.user._id.toString();
    const isOwner = query.courseId.educatorId.toString() === userId;
    const isCo = query.courseId.coInstructors?.some(c => c.userId.toString() === userId);
    if (!isOwner && !isCo) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const studentFirstName = query.studentId.name.split(' ')[0];
    const systemPrompt = `You are an expert teaching assistant helping an educator reply to a student. Output exactly 3 response options formatted as a JSON array of strings: ["Option 1", "Option 2", "Option 3"]. Keep each option to a maximum of 4 sentences. Option 1 must be direct, Option 2 must use an analogy, Option 3 must be highly encouraging. Never state that you are an AI. Address the student by their first name (${studentFirstName}).`;

    const userPrompt = `Course: ${query.courseId.title}, Question: ${query.question}`;

    console.log(`[AI] Generating drafts for query: ${queryId}`);
    
    const aiResponse = await fetch(`${process.env.OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API Error: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const text = aiData.choices[0].message.content;
    console.log(`[AI] Raw Response:`, text);

    // Parse JSON
    try {
      // Clean potential markdown or whitespace
      let cleanedJson = text.trim();
      cleanedJson = cleanedJson.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const drafts = JSON.parse(cleanedJson);

      if (!Array.isArray(drafts)) {
        throw new Error("Response is not a JSON array");
      }

      res.status(200).json({ success: true, data: drafts.slice(0, 3) });
    } catch (e) {
      console.error("AI JSON Parse Error:", e.message, "Text:", text);
      res.status(500).json({ success: false, message: "AI response format error. Please try again." });
    }
  } catch (error) {
    console.error("AI API Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const resolveQuery = async (req, res) => {
  try {
    const { answer } = req.body;
    const queryId = req.params.id || req.params.queryId;

    if (!answer) {
      return res.status(400).json({ success: false, message: "Answer is required" });
    }

    const query = await Query.findById(queryId).populate('courseId', 'educatorId coInstructors');

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    // Check if the user is the educator of this course (owner or co-instructor)
    const userId = req.user._id.toString();
    const isOwner = query.courseId.educatorId.toString() === userId;
    const isCo = query.courseId.coInstructors?.some(c => c.userId.toString() === userId);
    if (!isOwner && !isCo) {
      return res.status(403).json({ success: false, message: 'Not authorized to resolve this query' });
    }

    // First-come-first-serve lock: reject if already resolved
    if (query.status === 'resolved') {
      return res.status(409).json({ success: false, message: 'This query has already been answered by another instructor.' });
    }

    query.answer = answer;
    query.status = 'resolved';
    query.studentRead = false;
    query.repliedBy = req.user._id;
    await query.save();

    res.status(200).json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markQueryRead = async (req, res) => {
  try {
    const queryId = req.params.id || req.params.queryId;
    const query = await Query.findById(queryId);

    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    if (query.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    query.studentRead = true;
    await query.save();

    res.status(200).json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createQuery,
  getStudentQueries,
  getEducatorQueries,
  generateAIDrafts,
  resolveQuery,
  markQueryRead
};
