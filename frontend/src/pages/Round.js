import { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom"
import { GameProvider, useGameContext } from "../context/GameContext"
import { useAuthContext } from "../hooks/UseAuthContext"
import { 
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Stack,
    IconButton,
    Card,
    CardContent,
    Fade,
    Slide,
    Grid2,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { ArrowLeftCircle, HelpCircle, MessageCircleMore } from 'lucide-react';

const Round = () => {
    return (
        <GameProvider>
            <RoundComponent />
        </GameProvider>
    )
}

const RoundComponent = () => {

    const { user } = useAuthContext()
    const { game, course } = useGameContext()

    const { roundId } = useParams()

    const navigate = useNavigate()

    const [questionText, setQuestionText] = useState()
    const [questionId, setQuestionId] = useState()
    const [answerList, setAnswerList] = useState([])

    const [selectedAnswerId, setSelectedAnswerId] = useState()
    const [correctAnswerId, setCorrectAnswerId] = useState()
    const [submitted, setSubmitted] = useState(false)

    const [openFeedbackDialog, setFeedbackDialog] = useState(false)
    const [feedbackError, setFeedbackError] = useState();
    const [feedback, setFeedback] = useState();

    useEffect(() => {

        const fetchQuestion = async () => {
            try {

                const response = await fetch(`/api/round/${roundId}/fetchQuestion`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                })

                const json = await response.json()
                if (response.ok) {

                    if (!json.found) {
                        navigate(`/game/${game.gameId}`)
                        return
                    } else {
                        setQuestionText(json.question.text)
                        setQuestionId(json.question.questionId)
                        setAnswerList(json.answers)
                    }

                }

            } catch (err) {
                console.error(err)
            }
        }

        if (!submitted && user?.token && game?.gameId && roundId) fetchQuestion()

    }, [user, game, roundId, submitted])

    const handleSelect = (answer) => {
        if (submitted) return

        setSelectedAnswerId(answer.answerId)
    }

    const handleFeedbackSubmit = async () => {
		try {
			if (!feedback) {
				setFeedbackError("Feedback must not be empty!");
				return;
			}

			const bodyContent = {
				userId: user.userId,
                feedback: feedback
			};

			const response = await fetch(`/api/question/${questionId}/submitFeedback`, {
				method: "POST",
				body: JSON.stringify(bodyContent),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user.token}`,
				},
			});

			const json = await response.json();

			if (!response.ok) {
				setFeedbackError(json.error || "Could not submit feedback");
				return;
			}

			setFeedbackDialog(false);
			setFeedbackError();
			alert("Feedback Sent!");
		} catch (err) {
			setFeedbackError(err);
			console.error(err);
		}
	};

    const handleSubmit = async () => {

        if (!selectedAnswerId) return

        try {

            const bodyContent = {
                questionId: questionId,
                answerId: selectedAnswerId,
            }

            const response = await fetch(`/api/round/${roundId}/submitAnswer`, {
                method: 'POST',
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })

            const json = await response.json()
            if (response.ok) {

                setCorrectAnswerId(json.correctId)

                setSubmitted(true)
            }
        } catch (err) {
            console.error(err)
        }

    }

    const advanceQuestion = async () => {

        if (!submitted) return

        setQuestionText()
        setQuestionId()
        setAnswerList([])

        setSelectedAnswerId()
        setCorrectAnswerId()
        setSubmitted(false)
		setFeedback()
		setFeedbackError()
    }

    return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			{/* Header */}
			<Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
				<IconButton
					onClick={() => navigate(game ? `/game/${game.gameId}` : "/")}
					sx={{
						bgcolor: "background.paper",
						boxShadow: 1,
						"&:hover": { bgcolor: "grey.100" },
					}}>
					<ArrowLeftCircle />
				</IconButton>
				<Typography variant="h4" fontWeight="bold">
					Round {roundId}
				</Typography>
			</Box>

			{game && course && (
				<Fade in={true}>
					<Paper
						elevation={3}
						sx={{
							borderRadius: 3,
							overflow: "hidden",
						}}>
						{/* Question Section */}
						<Box
							sx={{
								p: 4,
								background: "linear-gradient(45deg, #2196F3 30%, #673AB7 90%)",
								color: "white",
							}}>
							<Grid2 container alignItems="center">
								<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
									<HelpCircle size={32} />
									<Typography variant="h5" fontWeight="medium">
										Question
									</Typography>
								</Stack>
								<Tooltip title="Submit Feedback">
									<IconButton
										onClick={() => setFeedbackDialog(true)}
										sx={{
											bgcolor: "background.paper",
											boxShadow: 1,
											"&:hover": { bgcolor: "grey.100" },
											marginLeft: "auto",
											title: "Submit Feedback",
										}}>
										<MessageCircleMore />
									</IconButton>
								</Tooltip>
							</Grid2>
							<Typography variant="h6">{questionText}</Typography>
						</Box>

						{/* Answer Options */}
						<Box sx={{ p: 4 }}>
							<Stack spacing={2}>
								{answerList &&
									answerList.map((answer, index) => (
										<Slide
											direction="right"
											in={true}
											style={{ transitionDelay: `${index * 100}ms` }}
											key={index}>
											<div>
												<AnswerOption
													answer={answer}
													selected={selectedAnswerId === answer.answerId}
													correct={submitted && correctAnswerId === answer.answerId}
													incorrect={
														submitted &&
														correctAnswerId !== selectedAnswerId &&
														selectedAnswerId === answer.answerId
													}
													handleSelect={handleSelect}
												/>
											</div>
										</Slide>
									))}
							</Stack>

							<Box sx={{ mt: 4, textAlign: "center" }}>
								<Button
									variant="contained"
									size="large"
									onClick={!submitted ? handleSubmit : advanceQuestion}
									disabled={!selectedAnswerId}
									sx={{
										px: 6,
										py: 1.5,
										borderRadius: 2,
										background: "linear-gradient(45deg, #2196F3 30%, #673AB7 90%)",
										"&:hover": {
											background: "linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)",
										},
									}}>
									{!submitted ? "Submit Answer" : "Next Question"}
								</Button>
							</Box>
						</Box>
					</Paper>
				</Fade>
			)}
			{/* Feedback Dialog */}
			<Dialog
				open={openFeedbackDialog}
				onClose={() => {
					setFeedbackDialog(false);
				}}
				fullWidth
				maxWidth="sm">
				<DialogTitle
					sx={{
						background: "linear-gradient(45deg, #2196F3 30%, #673AB7 90%)",
						color: "white",
					}}>
					Submit Question Feedback
				</DialogTitle>
				<Box>
					<DialogContent sx={{ pt: 3 }}>
						<TextField
							multiline={true}
							minRows={4}
							maxRows={8}
							fullWidth
							label="Feedback"
							error={!!feedbackError}
							helperText={feedbackError}
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
						/>
					</DialogContent>
					<DialogActions sx={{ p: 3 }}>
						<Button
							onClick={() => {
								setFeedbackDialog(false);
								setFeedbackError();
							}}>
							Cancel
						</Button>
						<Button
							onClick={handleFeedbackSubmit}
							variant="contained"
							sx={{
								background: "linear-gradient(45deg, #2196F3 30%, #673AB7 90%)",
								"&:hover": {
									background: "linear-gradient(45deg, #1976D2 30%, #5E35B1 90%)",
								},
							}}>
							Submit
						</Button>
					</DialogActions>
				</Box>
			</Dialog>
		</Container>
	);
};


const AnswerOption = ({ answer, selected, correct, incorrect, handleSelect }) => {
    const getBackgroundColor = () => {
        if (correct) return 'success.light';
        if (incorrect) return 'error.light';
        if (selected) return 'grey.200';
        return 'background.paper';
    };

    const getBorderColor = () => {
        if (correct) return 'success.main';
        if (incorrect) return 'error.main';
        if (selected) return 'primary.main';
        return 'grey.300';
    };

    return (
        <Card
            onClick={() => !correct && !incorrect && handleSelect(answer)}
            sx={{
                bgcolor: getBackgroundColor(),
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: getBorderColor(),
                transition: 'all 0.2s ease-in-out',
                cursor: correct || incorrect ? 'default' : 'pointer',
                '&:hover': {
                    transform: correct || incorrect ? 'none' : 'translateX(8px)',
                    bgcolor: correct || incorrect ? getBackgroundColor() : 'grey.100'
                }
            }}
        >
            <CardContent>
                <Typography 
                    variant="body1"
                    sx={{
                        color: correct || incorrect ? 'white' : 'text.primary',
                        fontWeight: selected ? 'bold' : 'regular'
                    }}
                >
                    {answer.text}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default Round;