import { useAuthContext } from "../../hooks/UseAuthContext";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../../css/general.css";
import "../../css/generalAssets.css";
import "../../css/gameList.css";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");
const timeStampToStr = (ts) => {
	const date = new Date(ts);

	return timeAgo.format(date);
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

const GameList = ({ title = "Games", masterList = false, course = null }) => {
	const { user } = useAuthContext();

	const [games, setGames] = useState([]);

	useEffect(() => {
		const fetchGames = async () => {
			try {
				const response = await fetch(
					`/api/user/${user.userId}/gamesWithNames/${course ? course.courseId : ""}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${user.token}`,
						},
					}
				);

				const json = await response.json();
				setGames(json.games);
			} catch (err) {
				console.error(err);
			}
		};

		if (user) {
			fetchGames();
		}
	}, [user, course]);

	return (
		<div className="content-card">
			<h1>{title}</h1>
			{games && games.map((g) => <Game game={g} key={g.gameId} />)}
		</div>
	);
};

export default GameList;
