import "../../css/generalAssets.css";
import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/UseAuthContext";
import { useCourseContext } from "../../context/CourseContext";
import { Avatar, Box, Button, Container, Grid2, Paper, Stack, Typography } from "@mui/material";
import { ChartBar } from "lucide-react";

const CourseGameStats = () => {
	const { user } = useAuthContext();
	const { course } = useCourseContext();
	const [gameStatsList, setGameStatsList] = useState([]);
	const [myGameStats, setMyGameStats] = useState();
	const [filter, setFilter] = useState("default");

	useEffect(() => {
		const fetchGameStats = async () => {
			try {
				const response = await fetch(`/api/course/${course.courseId}/gameStats`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${user.token}`,
					},
				});
				const json = await response.json();
				setGameStatsList(json);
				setMyGameStats(json.find((stats) => stats.userId === user.userId));
			} catch (err) {
				console.error(err);
			}
		};

		if (user && course) {
			fetchGameStats();
		}
	}, [user, course]);

	return (
		<Container maxWidth="xl" sx={{ py: 4 }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Stack direction="row" spacing={2} alignItems="center">
					<ChartBar size={32} color="#1976d2" />
					<Typography variant="h4" component="h1" fontWeight="bold">
						Game Statistics
					</Typography>
				</Stack>
			</Box>
			{/* Main Content Area */}
			<Grid2 xs={12} md={9}>
				{/* Game Stats */}
				<Paper sx={{ mb: 3, p: 3 }}>
					{myGameStats && (
						<Box>
							<Typography variant="h4" component="h1" fontWeight="bold" sx={{ pb: 2 }}>
								My Stats
							</Typography>
							<GameStatsHeader disabled={true} />
							<GameStatsCard gameStats={myGameStats} />
						</Box>
					)}
					{!myGameStats && (
						<Box textAlign="center">
							<Typography variant="h4">Play more games to get your game statistics!</Typography>
						</Box>
					)}
				</Paper>
				{gameStatsList && (
					<Paper sx={{ mb: 3, p: 3 }}>
						<Typography variant="h4" component="h1" fontWeight="bold" sx={{ pb: 2 }}>
							Leaderboard
						</Typography>
						<Box>
							<GameStatsHeader onClick={setFilter} />
							{[...gameStatsList]
								.sort((a, b) => filterFunction(a, b, filter))
								.map((member, index) => (
									<GameStatsCard gameStats={member} dark={index % 2 !== 0} key={index} />
								))}
						</Box>
					</Paper>
				)}
			</Grid2>
		</Container>
	);
};

const filterFunction = (a, b, filter) => {
	let diff = 0;
	if (filter === "default") {
		diff = b.gamesWon - b.gamesLost - (a.gamesWon - a.gamesLost);
	} else {
		diff = b[filter] - a[filter];
	}

	if (diff === 0) {
		diff = b.gamesPlayed - a.gamesPlayed;
	}
	if (diff === 0) {
		diff = a.userId - b.userId;
	}
	return diff;
};

const GameStatsHeader = ({ disabled, onClick }) => {
	return (
		<Box
			sx={{
				borderRadius: 0,
				bgcolor: "grey.300",
			}}>
			<Grid2 container spacing={2}>
				<Grid2 container spacing={2} size={2}></Grid2>
				<Grid2 container spacing={2} size={10}>
					<Grid2 textAlign="center" size={2} display="flex" justifyContent="center">
						<Button
							onClick={() => onClick("gamesWon")}
							variant="body1"
							disabled={disabled}
							sx={{
								"&:disabled": {
									color: "ButtonText",
								},
								"&:hover": {
									bgcolor: "grey.50",
								},
								borderRadius: 2,
							}}>
							{"Games Won"}
						</Button>
					</Grid2>
					<Grid2 textAlign="center" size={2} display="flex" justifyContent="center">
						<Button
							onClick={() => onClick("gamesTied")}
							variant="body1"
							disabled={disabled}
							sx={{
								"&:disabled": {
									color: "ButtonText",
								},
								"&:hover": {
									bgcolor: "grey.50",
								},
								borderRadius: 2,
							}}>
							{"Games Tied"}
						</Button>
					</Grid2>
					<Grid2 textAlign="center" size={2} display="flex" justifyContent="center">
						<Button
							onClick={() => onClick("gamesLost")}
							variant="body1"
							disabled={disabled}
							sx={{
								"&:disabled": {
									color: "ButtonText",
								},
								"&:hover": {
									bgcolor: "grey.50",
								},
								borderRadius: 2,
							}}>
							{"Games Lost"}
						</Button>
					</Grid2>
					<Grid2 textAlign="center" size={2} display="flex" justifyContent="center">
						<Button
							onClick={() => onClick("gamesPlayed")}
							variant="body1"
							disabled={disabled}
							sx={{
								"&:disabled": {
									color: "ButtonText",
								},
								"&:hover": {
									bgcolor: "grey.50",
								},
								borderRadius: 2,
							}}>
							{"Games Played"}
						</Button>
					</Grid2>
					<Grid2 textAlign="center" size={2} display="flex" justifyContent="center">
						<Button
							onClick={() => onClick("questionsCorrect")}
							variant="body1"
							disabled={disabled}
							sx={{
								"&:disabled": {
									color: "ButtonText",
								},
								"&:hover": {
									bgcolor: "grey.50",
								},
								borderRadius: 2,
							}}>
							{"Questions Correct"}
						</Button>
					</Grid2>
					<Grid2 textAlign="center" size={2} display="flex" justifyContent="center">
						<Button
							onClick={() => onClick("questionsAnswered")}
							variant="body1"
							disabled={disabled}
							sx={{
								"&:disabled": {
									color: "ButtonText",
								},
								"&:hover": {
									bgcolor: "grey.50",
								},
								borderRadius: 2,
							}}>
							{"Questions Answered"}
						</Button>
					</Grid2>
				</Grid2>
			</Grid2>
		</Box>
	);
};

const GameStatsCard = ({ gameStats, dark }) => {
	return (
		<Box
			sx={{
				borderRadius: 0,
				"&:hover": {
					bgcolor: "grey.50",
				},
				py: 2,
				...(dark && {
					bgcolor: "grey.100",
					"&:hover": {
						bgcolor: "grey.200",
					},
				}),
			}}>
			<Grid2 container spacing={2}>
				<Grid2 container spacing={2} size={2}>
					<Stack direction="row" spacing={3} alignItems="center" sx={{ pl: 2 }}>
						<Avatar
							sx={{
								width: 24,
								height: 24,
								bgcolor: "primary.main",
								fontSize: "0.875rem",
							}}>
							{gameStats.user.firstName ? gameStats.user.firstName[0] : ""}
						</Avatar>
						<Typography variant="body2" color="text.secondary">
							{gameStats.user.firstName} {gameStats.user.lastName}
						</Typography>
					</Stack>
				</Grid2>
				<Grid2 container spacing={2} size={10}>
					<Grid2 textAlign="center" size={2}>
						<Typography variant="body1">{gameStats.gamesWon}</Typography>
					</Grid2>
					<Grid2 textAlign="center" size={2}>
						<Typography variant="body1">{gameStats.gamesTied}</Typography>
					</Grid2>
					<Grid2 textAlign="center" size={2}>
						<Typography variant="body1">{gameStats.gamesLost}</Typography>
					</Grid2>
					<Grid2 textAlign="center" size={2}>
						<Typography variant="body1">{gameStats.gamesPlayed}</Typography>
					</Grid2>
					<Grid2 textAlign="center" size={2}>
						<Typography variant="body1">{gameStats.questionsCorrect}</Typography>
					</Grid2>
					<Grid2 textAlign="center" size={2}>
						<Typography variant="body1">{gameStats.questionsAnswered}</Typography>
					</Grid2>
				</Grid2>
			</Grid2>
		</Box>
	);
};

export default CourseGameStats;
