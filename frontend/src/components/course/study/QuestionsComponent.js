import React, { useState } from 'react';
import { useAuthContext } from '../../../hooks/UseAuthContext';
import { useCourseContext } from '../../../hooks/UseCourseContext';
import QuestionDetails from './QuestionDetails';
import {
  Box,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormLabel,
} from '@mui/material';
import { Add, ExpandMore, PhotoCamera } from '@mui/icons-material';

const QuestionsComponent = ({ questions, setQuestions, topics, refresh }) => {
  const { user } = useAuthContext();
  const { course } = useCourseContext();

  const [questionTopicName, setTopicName] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState('regular');
  const [questionImageFile, setQuestionImageFile] = useState();
  const [questionImagePreview, setQuestionImagePreview] = useState();
  const [questionImageBase64, setQuestionImageBase64] = useState();
  const [createQuestionFormError, setCreateQuestionFormError] = useState();
  const [answerList, setAnswerList] = useState([]);

  if (user.userId !== course.coordinatorId) return null;

  const resetCreateQuestionForm = () => {
    setTopicName('');
    setQuestionText('');
    setQuestionDifficulty('regular');
    setQuestionImageFile(null);
    setQuestionImagePreview(null);
    setQuestionImageBase64(null);
    setCreateQuestionFormError();
    setAnswerList([]);
  };

  const createQuestionSubmit = async (e) => {
    e.preventDefault();

    try {
      const topic = topics.find(topic => topic.topicName === questionTopicName);
      if (!topic) {
        setCreateQuestionFormError('No such topic');
        return;
      }

      const bodyContent = {
        text: questionText,
        topicId: topic.topicId,
        imageMimeType: questionImageFile?.type,
        imageBase64: questionImageBase64,
        difficulty: questionDifficulty,
        answerList,
      };

      const response = await fetch(`/api/question/`, {
        method: 'POST',
        body: JSON.stringify(bodyContent),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        }
      });

      const json = await response.json();
      if (!response.ok) {
        setCreateQuestionFormError(json.error || 'Failed to create question');
        return;
      }

      setCreateQuestionFormError();
      setQuestions(prev => [...prev, json.question]);
      resetCreateQuestionForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuestionImageFile(file);

      const previewUrl = URL.createObjectURL(file);
      setQuestionImagePreview(previewUrl);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        setQuestionImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAnswerChoice = () => {
    setAnswerList(prev => [...prev, { text: '', isCorrect: false }]);
  };

  const handleAnswerChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setAnswerList(prev => 
      prev.map((answer, i) => 
        i === index 
          ? { ...answer, [name]: type === 'checkbox' ? checked : value } 
          : answer
      )
    );
  };

    const handleExport = async () => {

        try {

            const response = await fetch(`/api/course/${course.courseId}/export/questions`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user.token}`,
                }
            })

            if (!response.ok) throw Error('POST to export route failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)

            const a = document.createElement('a');
            a.href = url;
            a.download = 'cc_questions.csv'
            document.body.appendChild(a)
            a.click()
            a.remove()

        } catch (err) {
            console.error(err)
            alert('Could not export questions')
        }

    }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Questions</Typography>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Create Question</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="form" onSubmit={createQuestionSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Topic Name"
              value={questionTopicName}
              onChange={(e) => setTopicName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Question Text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            
            <Box>
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{
                  padding: '6px 16px',
                  fontSize: '0.8125rem',
                  minWidth: 'auto',
                }}
              >
                Upload Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {questionImageFile && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {questionImageFile.name}
                </Typography>
              )}
            </Box>

            {questionImagePreview && (
              <Box sx={{
                mt: 2,
                width: '300px',
                height: '200px',
                overflow: 'scroll',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'grey.200',
                borderRadius: '4px',
              }}>
                <img 
                  src={questionImagePreview} 
                  alt="Question image preview" 
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                />
              </Box>
            )}
            
            <FormControl component="fieldset">
              <FormLabel component="legend">Question Difficulty</FormLabel>
              <RadioGroup
                row
                value={questionDifficulty}
                onChange={(e) => setQuestionDifficulty(e.target.value)}
              >
                <FormControlLabel value="easy" control={<Radio />} label="Easy" />
                <FormControlLabel value="regular" control={<Radio />} label="Regular" />
                <FormControlLabel value="hard" control={<Radio />} label="Hard" />
              </RadioGroup>
            </FormControl>
            
            <Typography variant="h6">Answer Choices ({answerList.length})</Typography>
            <Button startIcon={<Add />} onClick={addAnswerChoice}>
              Add Answer Choice
            </Button>
            {answerList.map((answer, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Checkbox
                  checked={answer.isCorrect}
                  onChange={(e) => handleAnswerChange(index, e)}
                  name="isCorrect"
                />
                <TextField
                  fullWidth
                  value={answer.text}
                  onChange={(e) => handleAnswerChange(index, e)}
                  name="text"
                  placeholder="Answer option text"
                  required
                />
              </Box>
            ))}
            <Button type="submit" variant="contained" color="primary">
              Create Question
            </Button>
            {createQuestionFormError && (
              <Typography color="error">{createQuestionFormError}</Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>View Questions ({questions ? questions.length : 0})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions && questions.map(question => (
              <QuestionDetails
                key={question.questionId}
                question={question}
                hasImage={question.hasImage}
                topics={topics}
                refresh={refresh}
                onDelete={() => { setQuestions(questions.filter(q => q.questionId !== question.questionId)) }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
      <button className='standard-button' onClick={handleExport}>Export Questions</button>
    </Box>
  );
};

export default QuestionsComponent;
