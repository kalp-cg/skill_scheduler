import React, { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const Dashboard = () => {
  const [progress, setProgress] = useState(0);
  const [studyHours, setStudyHours] = useState(0);
  const [quizProgress, setQuizProgress] = useState(0);
  const [notes, setNotes] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllNotes, setShowAllNotes] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [progressRes, dashboardRes, examsRes] = await Promise.all([
        fetch("https://skill-scheduler.onrender.com/api/dashboard/progress"),
        fetch("https://skill-scheduler.onrender.com/api/dashboard/dashboard"),
        fetch("https://skill-scheduler.onrender.com/api/dashboard/upcoming-exams"),
      ]);
  
      const progressData = await progressRes.json();
      setProgress(progressData.completion || 0);
      setStudyHours(progressData.studiedHours || 0);
      setQuizProgress(progressData.quizProgress || 0);
  
      const dashboardData = await dashboardRes.json();
      setNotes(dashboardData.notesOverview || []);
  
      let examsData = await examsRes.json();
      
      // Sort exams by date (ascending order)
      examsData = examsData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setUpcomingExams(examsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const MAX_NOTES_TO_SHOW = 3;

  return (
    <div className="bg-white-600 text-black p-6 flex flex-col items-center w-screen h-[calc(100vh-64px)] mt-[64px] overflow-y-auto">
      <h1 className="text-3xl font-bold">Welcome to Skill Scheduler</h1>
      <p className="text-lg text-gray-400 mt-2">Focus Forward</p>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ClipLoader color="black" size={50} />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mt-6">
          <div className="bg-black p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold mb-2 text-white">Progress Overview</h3>
            <div className="relative w-24 h-24 mx-auto rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-2xl text-white">{studyHours}Hr</span>
            </div>
            <p className="mt-2 text-white">Your Progress</p>
            <div className="mt-4">
              <p className="text-sm text-white">Quiz Progress</p>
              <div className="w-full bg-white h-3 rounded-full mt-2">
                <div className="bg-white h-2 rounded-full" style={{ width: `${quizProgress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-black p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-white">Points from Notes</h3>
            {notes.length > 0 ? (
              <>
                {notes.slice(0, showAllNotes ? notes.length : MAX_NOTES_TO_SHOW).map((note, index) => (
                  <p key={index} className="text-gray-300 text-sm border-b border-gray-700 py-2">{note.content}</p>
                ))}
                {notes.length > MAX_NOTES_TO_SHOW && (
                  <button
                    onClick={() => setShowAllNotes(!showAllNotes)}
                    className="text-gray-400 text-sm mt-2 hover:text-white focus:outline-none cursor-pointer"
                  >
                    {showAllNotes ? "See Less" : "..."}
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-400">No notes available.</p>
            )}
          </div>

          <div className="bg-black p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-white">Exam Priority</h3>
            <ul>
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam, index) => (
                  <li key={index} className="text-gray-300 py-1">{exam.subject} - {exam.date}</li>
                ))
              ) : (
                <p className="text-gray-400">No upcoming exams.</p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;