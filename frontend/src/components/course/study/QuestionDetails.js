import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../hooks/UseAuthContext';
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  Radio,
  Checkbox,
  FormControl,
  FormLabel,
  IconButton,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import { Delete, Edit, Close, Add } from '@mui/icons-material';

const QuestionDetails = ({ question, hasImage, topics, onDelete, refresh }) => {
  const { user } = useAuthContext();
  const [answerList, setAnswerList] = useState([]);
  const [pictureUrl, setPictureUrl] = useState();
  const [deleteQuestionDialogEnabled, setDeleteQuestionDialogEnabled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...question, topicName: topics.find(topic => topic.topicId === question.topicId)?.topicName || 'No Topic' });
  const [formError, setFormError] = useState();
  const [newAnswers, setNewAnswers] = useState([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const response = await fetch(`/api/question/${question.questionId}/answers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          }
        });

        if (response.ok) {
          const json = await response.json();
          setAnswerList(json.answers);
          setNewAnswers(json.answers);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchPicture = async () => {
      if (hasImage) {
        try {
          const response = await fetch(`/api/question/${question.questionId}/picture`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`,
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setPictureUrl(imageUrl);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchAnswers();
    fetchPicture();
  }, [question, user, hasImage]);

  const handleDeleteQuestion = async () => {
    try {
      await fetch(`/api/question/${question.questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        }
      });
      onDelete();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (index, field, value) => {
    const nextAnswers = [...newAnswers];
    nextAnswers[index] = { ...nextAnswers[index], [field]: value };
    setNewAnswers(nextAnswers);
  };

  const addAnswer = () => {
    setNewAnswers(prev => [...prev, { text: '', isCorrect: false }]);
  };

  const removeAnswer = (index) => {
    setNewAnswers(newAnswers.filter((_, i) => index !== i));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setNewAnswers(answerList.map(a => ({ ...a })));
      setFormData({ ...question, topicName: topics.find(topic => topic.topicId === question.topicId)?.topicName || 'No Topic' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const topic = topics.find(topic => topic.topicName === formData.topicName);
      if (!topic) {
        setFormError('No such topic');
        return;
      }

      if (newAnswers.some(a => !a.text || a.text === '')) {
        setFormError("Cannot have blank answers");
        return;
      }

      const bodyContent = {
        text: formData.text,
        topicId: topic.topicId,
        difficulty: formData.difficulty,
        answerList: newAnswers.map(a => ({ text: a.text, isCorrect: a.isCorrect }))
      };

      const response = await fetch(`/api/question/${question.questionId}`, {
        method: 'PATCH',
        body: JSON.stringify(bodyContent),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        }
      });

      const json = await response.json();
      if (!response.ok) {
        setFormError(json.error || 'Failed to update question');
        return;
      }

      setFormError(undefined);
      refresh();
      setIsEditing(false);
    } catch (err) {
      setFormError('Failed to update question');
      console.log(err);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleEditSubmit}>
          <TextField
            fullWidth
            label="Question"
            name="text"
            value={formData.text}
            onChange={handleFormChange}
            disabled={!isEditing}
            variant={isEditing ? "outlined" : "filled"}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Topic"
            name="topicName"
            value={formData.topicName}
            onChange={handleFormChange}
            disabled={!isEditing}
            variant={isEditing ? "outlined" : "filled"}
            sx={{ mb: 2 }}
          />
        
            <FormControl 
                disabled={!isEditing}
                //variant={isEditing ? "outlined" : "filled"}
                component="fieldset"
                sx={{ mb: 2 }}
            >  
              <FormLabel component="legend">Question Difficulty</FormLabel>
              <RadioGroup
                row
                name='difficulty'
                value={formData.difficulty}
                onChange={handleFormChange}
              >
                <FormControlLabel value="easy" control={<Radio />} label="Easy" />
                <FormControlLabel value="regular" control={<Radio />} label="Regular" />
                <FormControlLabel value="hard" control={<Radio />} label="Hard" />
              </RadioGroup>
            </FormControl>

          {pictureUrl && (
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '200px',
                bgcolor: 'grey.200',
                borderRadius: '4px',
                overflow: 'scroll',
              }}
            >
              <img
                src={pictureUrl}
                alt="Question"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                }}
              />
            </Box>
          )}

          <Typography variant="h6" sx={{ mb: 1 }}>Answer Choices:</Typography>
          {(isEditing ? newAnswers : answerList).map((answer, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={answer.isCorrect}
                    onChange={(e) => handleAnswerChange(index, "isCorrect", e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label=""
              />
              <TextField
                fullWidth
                value={answer.text}
                onChange={(e) => handleAnswerChange(index, "text", e.target.value)}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
              {isEditing && (
                <IconButton onClick={() => removeAnswer(index)}>
                  <Close />
                </IconButton>
              )}
            </Box>
          ))}
          {isEditing && (
            <Button startIcon={<Add />} onClick={addAnswer} sx={{ mt: 1 }}>
              Add Answer Choice
            </Button>
          )}

          {formError && (
            <Typography color="error" sx={{ mt: 2 }}>{formError}</Typography>
          )}
        </Box>
      </CardContent>
      <CardActions>
        {isEditing ? (
          <>
            <Button variant="contained" color="primary" type="submit" onClick={handleEditSubmit}>
              Save Changes
            </Button>
            <Button variant="outlined" onClick={toggleEdit}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button startIcon={<Edit />} onClick={toggleEdit}>
              Edit
            </Button>
            <Button startIcon={<Delete />} color="error" onClick={() => setDeleteQuestionDialogEnabled(true)}>
              Delete
            </Button>
          </>
        )}
      </CardActions>

      <Dialog open={deleteQuestionDialogEnabled} onClose={() => setDeleteQuestionDialogEnabled(false)}>
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this question?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteQuestionDialogEnabled(false)}>Cancel</Button>
          <Button onClick={() => {
            setDeleteQuestionDialogEnabled(false);
            handleDeleteQuestion();
          }} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default QuestionDetails;