const { default: mongoose } = require("mongoose");
const { instance } = require("../config/razorpay");
const crypto = require("crypto");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

// temp capture the payment and initiate the order;
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.userId;

  // if course not found
  if (courses.length === 0) {
    return res.json({
      success: false,
      message: "Please Provide valid course id",
    });
  }
  for (const course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);

      if (!course) {
        return res.status(200).json({
          success: false,
          message: "could not find the course",
        });
      }

      // Check if the user is already enrolled in the course or not
      const uId = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uId)) {
        return res.status(200).json({
          success: false,
          message: "Student is already enrolled",
        });
      }

    // return success response
    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });

     
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    
    
  }
};


// temporary verify the payment
exports.verifyPayment = async (req, res) => {
 
  const courses = req.body?.courses;

  const userId = req.user.id;

  // if any of these are not found
  if (
    !courses ||
    !userId
  ) {
    return res.status(200).json({
      success: false,
      message: "Payment Failed",
    });
  }
  await enrollStudents(courses, userId, res);

    // return success response
    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });
};

// enroll student
const enrollStudents = async (courses, userId, res) => {
  try {
    if (!courses || !userId) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Course ID and User ID",
      });
    }

    for (const courseId of courses) {
      // find the course and enroll the student
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" });
      }

      console.log("Updated course: ", enrolledCourse);

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });

      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      console.log("Enrolled student: ", enrolledStudent);

     // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );
      console.log("Email sent successfully: ", emailResponse.response);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
};
