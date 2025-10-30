import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Brain, ArrowRight, ArrowLeft } from "lucide-react";
import { getCurrentUser, setCurrentUser, type VolunteerData } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";

interface VolunteerExamProps {
  volunteerData: VolunteerData;
  onExamComplete: (passed: boolean, score: number) => void;
  onClose: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

interface QualifiedVolunteer {
  _id: string;
  name: string;
  examScore: number;
  dateRegistered: string;
  location?: string;
}

const examQuestions: Question[] = [
  { id: 1, question: "What is the first priority during any emergency situation?", options: ["Save property", "Ensure personal safety", "Help others", "Call for help"], correct: 1 },
  { id: 2, question: "In case of a flood, what should you NOT do?", options: ["Move to higher ground", "Walk through moving water", "Turn off utilities", "Have emergency supplies ready"], correct: 1 },
  { id: 3, question: "What does the acronym STOP stand for in emergency response?", options: ["Stop, Think, Observe, Proceed", "Stay, Talk, Organize, Plan", "Secure, Transport, Organize, Protect", "Stop, Take cover, Observe, Plan"], correct: 0 },
  { id: 4, question: "How long can a person typically survive without water?", options: ["1 day", "3 days", "1 week", "2 weeks"], correct: 1 },
  { id: 5, question: "What is the universal distress signal?", options: ["2 short signals", "3 signals of any kind", "Continuous signaling", "1 long signal"], correct: 1 },
  { id: 6, question: "In earthquake safety, what should you do if you're indoors?", options: ["Run outside immediately", "Stand in a doorway", "Drop, Cover, and Hold On", "Hide under stairs"], correct: 2 },
  { id: 7, question: "What percentage of the human body is water?", options: ["50%", "60%", "70%", "80%"], correct: 1 },
  { id: 8, question: "What is the recommended emergency supply of water per person per day?", options: ["1 liter", "2 liters", "4 liters", "6 liters"], correct: 2 },
  { id: 9, question: "What should be the first step when encountering a fire?", options: ["Try to extinguish it", "Alert others and evacuate", "Call 911", "Save valuable items"], correct: 1 },
  { id: 10, question: "How often should emergency supplies be checked and updated?", options: ["Monthly", "Every 6 months", "Annually", "Every 2 years"], correct: 1 }
];

const VolunteerExam = ({ volunteerData, onExamComplete, onClose }: VolunteerExamProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(examQuestions.length).fill(-1));
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [qualifiedVolunteers, setQualifiedVolunteers] = useState<QualifiedVolunteer[]>([]);
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  // Fetch qualified volunteers when passed
  useEffect(() => {
    const fetchQualifiedVolunteers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/volunteers/recent",
          { headers: { Authorization: `Bearer ${currentUser?.token}` } }
        );
        setQualifiedVolunteers(res.data.volunteers);
      } catch (err) {
        console.error("Error fetching volunteers:", err);
      }
    };
    if (showResults && score >= 70) {
      fetchQualifiedVolunteers();
    }
    // eslint-disable-next-line
  }, [showResults, score, currentUser]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === -1) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || -1);
    } else {
      calculateScore(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || -1);
    }
  };

  const saveVolunteerToDB = async (updatedVolunteerData: VolunteerData) => {
    if (!currentUser || !currentUser.token) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/volunteers/save",
        {
          examPassed: updatedVolunteerData.examPassed,
          examScore: updatedVolunteerData.examScore,
          volunteerStatus: updatedVolunteerData.examPassed ? "active" : "pending",
        },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      setCurrentUser(res.data.user);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save volunteer data. Try again later.",
        variant: "destructive"
      });
    }
  };

  const calculateScore = (finalAnswers: number[]) => {
    let correctAnswers = 0;
    examQuestions.forEach((question, index) => {
      if (finalAnswers[index] === question.correct) correctAnswers++;
    });
    const scorePercentage = (correctAnswers / examQuestions.length) * 100;
    setScore(scorePercentage);
    setShowResults(true);
    const passed = scorePercentage >= 70;
    if (currentUser) {
      const updatedVolunteerData: VolunteerData = {
        ...volunteerData,
        examPassed: passed,
        examScore: scorePercentage,
        isVolunteer: passed,
        dateRegistered: passed ? new Date().toISOString() : volunteerData.dateRegistered,
        volunteerStatus: passed ? "active" : "pending",
      };
      saveVolunteerToDB(updatedVolunteerData);
      onExamComplete(passed, scorePercentage);
      if (passed) {
        toast({
          title: "Congratulations! 🎉",
          description: "You passed the exam and are now a qualified volunteer!",
        });
      } else {
        toast({
          title: "Exam Not Passed",
          description: "You need 70% to pass. You can retake the exam later.",
          variant: "destructive"
        });
      }
    }
  };

  const retakeExam = () => {
    setCurrentQuestion(0);
    setAnswers(new Array(examQuestions.length).fill(-1));
    setSelectedAnswer(-1);
    setShowResults(false);
    setScore(0);
  };

  const progress = ((currentQuestion + 1) / examQuestions.length) * 100;

  if (showResults) {
    const passed = score >= 70;
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            {passed ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">{passed ? "Exam Passed!" : "Exam Not Passed"}</CardTitle>
          <CardDescription>
            Your Score: {score.toFixed(0)}% ({examQuestions.filter((q, i) => answers[i] === q.correct).length}/{examQuestions.length} correct)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className={passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
            <AlertDescription>
              {passed 
                ? "Congratulations! You are now a qualified volunteer and can respond to emergency situations in your area."
                : "You need at least 70% to become a qualified volunteer. Don't worry, you can retake the exam anytime."
              }
            </AlertDescription>
          </Alert>
          <div className="flex gap-4">
            {!passed && <Button onClick={retakeExam} className="flex-1">Retake Exam</Button>}
            <Button variant="outline" onClick={onClose} className="flex-1">
              {passed ? "View Available Volunteers" : "Close"}
            </Button>
          </div>
          {passed && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Recently Qualified Volunteers</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {qualifiedVolunteers.length > 0 ? (
                  qualifiedVolunteers.map((volunteer) => (
                    <div 
                      key={volunteer._id}
                      className="p-3 border rounded-lg bg-white flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{volunteer.name}</p>
                        <p className="text-sm text-gray-600">
                          Score: {volunteer.examScore.toFixed(0)}% | 
                          Qualified: {new Date(volunteer.dateRegistered).toLocaleDateString()}
                        </p>
                      </div>
                      {volunteer.location && (
                        <span className="text-sm text-gray-500">{volunteer.location}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No qualified volunteers found.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <CardTitle>Volunteer Qualification Exam</CardTitle>
          </div>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
        <CardDescription>
          Question {currentQuestion + 1} of {examQuestions.length} • {score >= 70 ? "Pass" : "70%"} required to pass
        </CardDescription>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{examQuestions[currentQuestion].question}</h3>
            <div className="space-y-3">
              {examQuestions[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedAnswer === index ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedAnswer === index ? "border-primary bg-primary" : "border-muted-foreground"
                    }`} />
                    <span className="text-sm">{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button onClick={handleNext} disabled={selectedAnswer === -1}>
            {currentQuestion === examQuestions.length - 1 ? "Submit Exam" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VolunteerExam;
