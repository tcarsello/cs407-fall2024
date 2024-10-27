import { useAuthContext } from "../../hooks/UseAuthContext";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../../css/general.css";
import "../../css/generalAssets.css";
import "../../css/gameList.css";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");
const timeStampToStr = (ts) => {
	const org_date = new Date(ts);
	const date = Math.min(Date.now(), org_date);

	return timeAgo.format(date, { future: false });
};

const Game = ({ game }) => {
	return (
		<Link to={`/game/${game.gameId}`} className="gameLink">
			<div className="content-card" id="gameDiv">
				<h2>
					{game.playerOneFirstName} vs {game.playerTwoFirstName}
				</h2>
				<p>Game Status: {game.status}</p>
				<p>{timeStampToStr(game.updatedAt)}</p>
			</div>
		</Link>
	);
};

const GameList = ({ title = "My Games", masterList = false, course = null }) => {
	const { user } = useAuthContext();

	const [games, setGames] = useState([]);

	useEffect(() => {
		const fetchGames = async () => {
			try {
				const queryString =
					masterList && course != null
						? `/api/course/${course.courseId}/courseGamesWithNames`
						: `/api/user/${user.userId}/gamesWithNames/${course ? course.courseId : ""}`;
				const response = await fetch(queryString, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${user.token}`,
					},
				});

				const json = await response.json();
				setGames(json.games);
			} catch (err) {
				console.error(err);
			}
		};

		if (user) {
			fetchGames();
		}
	}, [user, course, masterList]);

	return (
		<div className="content-card">
			<h1>{title}</h1>
			{games && games.map((g) => <Game game={g} key={g.gameId} />)}
		</div>
	);
};

export default GameList;
