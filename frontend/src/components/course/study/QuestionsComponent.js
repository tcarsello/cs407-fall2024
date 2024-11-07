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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { 
  ChevronDown,
  Plus, 
  Camera,
  Upload,
  Download,
  HelpCircle,
  X 
} from 'lucide-react';

import PopupForm from '../../PopupForm'

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

    const [importEnabled, setImportEnabled] = useState(false)
    const [importError, setImportError] = useState('')
    const [importFile, setImportFile] = useState(null)
    const [importFileBase64, setImportFileBase64] = useState()

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

    const handleImport = async (e) => {
        e.preventDefault()
        try {
            if (!importFile || !importFileBase64) {
                setImportError('No import file selected')
                throw Error('No file selected')
            }

            const response = await fetch(`/api/course/${course.courseId}/import/questions`, {
                method: 'POST',
                body: JSON.stringify({
                    fileBase64: importFileBase64,
                }),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user.token}`,
                }
            })

            if (!response.ok) {
                setImportError('Failed to import CSV file')
                throw Error('Failed to import CSV file')
            }

            setImportEnabled(false)
            setImportFile(null)
            setImportError()
        } catch (err) {
            console.error(err)
        }
        refresh()
    }

    const handleImportFileChange = (e) => {
        setImportFile(e.target.files[0])
        
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            setImportFileBase64(base64);
          };
          reader.readAsDataURL(e.target.files[0]);
     
    }

    return (
      <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
        {/* Header Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <HelpCircle size={32} color="#1976d2" />
            <Typography variant="h4" fontWeight="bold">
              Question Bank
            </Typography>
            <Chip 
              label={`${questions ? questions.length : 0} Questions`} 
              color="primary" 
              sx={{ ml: 2 }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download size={20} />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload size={20} />}
              onClick={() => setImportEnabled(true)}
            >
              Import
            </Button>
          </Stack>
        </Stack>
  
        {/* Create Question Section */}
        <Paper elevation={2} sx={{ mb: 4, overflow: 'hidden' }}>
          <Accordion>
            <AccordionSummary 
              expandIcon={<ChevronDown size={20} />}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                color: 'white'
              }}
            >
              <Typography variant="h6">Create New Question</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Box component="form" onSubmit={createQuestionSubmit}>
                <Stack spacing={3}>
                  {createQuestionFormError && (
                    <Alert severity="error">{createQuestionFormError}</Alert>
                  )}
  
                  <TextField
                    label="Topic Name"
                    value={questionTopicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                  />
  
                  <TextField
                    label="Question Text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    required
                    variant="outlined"
                  />
  
                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Camera size={20} />}
                      sx={{ mr: 2 }}
                    >
                      Upload Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {questionImageFile && (
                      <Chip 
                        label={questionImageFile.name}
                        onDelete={() => {
                          setQuestionImageFile(null);
                          setQuestionImagePreview(null);
                          setQuestionImageBase64(null);
                        }}
                      />
                    )}
                  </Box>
  
                  {questionImagePreview && (
                    <Paper 
                      elevation={1} 
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        maxWidth: 400,
                        mx: 'auto'
                      }}
                    >
                      <img 
                        src={questionImagePreview} 
                        alt="Preview" 
                        style={{ 
                          width: '100%', 
                          height: 'auto',
                          borderRadius: 8
                        }} 
                      />
                    </Paper>
                  )}
  
                  <FormControl component="fieldset">
                    <FormLabel>Difficulty Level</FormLabel>
                    <RadioGroup
                      row
                      value={questionDifficulty}
                      onChange={(e) => setQuestionDifficulty(e.target.value)}
                    >
                      <FormControlLabel 
                        value="easy" 
                        control={<Radio color="success" />} 
                        label="Easy" 
                      />
                      <FormControlLabel 
                        value="regular" 
                        control={<Radio color="primary" />} 
                        label="Regular" 
                      />
                      <FormControlLabel 
                        value="hard" 
                        control={<Radio color="error" />} 
                        label="Hard" 
                      />
                    </RadioGroup>
                  </FormControl>
  
                  <Divider />
  
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Answer Choices</Typography>
                      <Button
                        startIcon={<Plus size={20} />}
                        onClick={addAnswerChoice}
                        variant="outlined"
                        size="small"
                      >
                        Add Answer
                      </Button>
                    </Stack>
  
                    {answerList.map((answer, index) => (
                      <Paper 
                        key={index} 
                        variant="outlined"
                        sx={{ p: 2 }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Checkbox
                            checked={answer.isCorrect}
                            onChange={(e) => handleAnswerChange(index, e)}
                            name="isCorrect"
                            color="success"
                          />
                          <TextField
                            fullWidth
                            value={answer.text}
                            onChange={(e) => handleAnswerChange(index, e)}
                            name="text"
                            placeholder="Enter answer text"
                            size="small"
                            required
                          />
                          <IconButton 
                            onClick={() => {
                              setAnswerList(prev => prev.filter((_, i) => i !== index));
                            }}
                            color="error"
                            size="small"
                          >
                            <X size={20} />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
  
                  <Button 
                    type="submit" 
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 3,
                      background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                      color: 'white'
                    }}
                  >
                    Create Question
                  </Button>
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
  
        {/* Questions List Section */}
        <Paper elevation={2}>
          <Accordion>
            <AccordionSummary 
              expandIcon={<ChevronDown size={20} />}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                color: 'white'
              }}
            >
              <Typography variant="h6">View All Questions</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Stack spacing={2}>
                {questions && questions.map(question => (
                  <QuestionDetails
                    key={question.questionId}
                    question={question}
                    hasImage={question.hasImage}
                    topics={topics}
                    refresh={refresh}
                    onDelete={() => {
                      setQuestions(questions.filter(q => q.questionId !== question.questionId));
                    }}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Paper>
  
        {/* Import Dialog */}
        <Dialog 
          open={importEnabled} 
          onClose={() => {
            setImportError('');
            setImportFile(null);
            setImportEnabled(false);
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
            color: 'white'
          }}>
            Import Questions from CSV
          </DialogTitle>
          <form onSubmit={handleImport}>
            <DialogContent sx={{ pt: 3 }}>
              <Stack spacing={3}>
                {importError && (
                  <Alert severity="error">{importError}</Alert>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload size={20} />}
                  fullWidth
                >
                  Choose CSV File
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleImportFileChange}
                  />
                </Button>
                {importFile && (
                  <Chip 
                    label={importFile.name}
                    onDelete={() => setImportFile(null)}
                    color="primary"
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setImportEnabled(false)}>Cancel</Button>
              <Button 
                type="submit"
                variant="contained"
                disabled={!importFile}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #673AB7 90%)',
                }}
              >
                Import
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    );
  };
  
  export default QuestionsComponent;