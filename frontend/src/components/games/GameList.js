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

const Game = ({ game, history }) => {
	return (
		<Link to={`/game/${game.gameId}`} className="gameLink">
			<div className="content-card" id="gameDiv">
				<h2>
					{game.playerOneFirstName} vs {game.playerTwoFirstName}
				</h2>
				{!history && <p className={game.status.replaceAll(" ", "").toLowerCase()}>{game.status}</p>}
				{history && (
					<p className={game.victory ? "victory" : "defeat"}>{game.outcome}</p>
				)}
				<p className="time">{timeStampToStr(game.updatedAt)}</p>
			</div>
		</Link>
	);
};

const GameList = ({
	title = "Active Games",
	history = false,
	masterList = false,
	course = null,
	divClass = "content-card",
}) => {
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
				const gameArray = json.games;
				if (history) {
					const filteredGamesWithVictory = gameArray.reduce((accumulator, game) => {
						if (game.status === "Player One Win" || game.status === "Player Two Win" || game.status === 'Tie') {
							game.victory = (user.userId === game.playerOneId) === (game.status === "Player One Win");
                            if (game.status === 'Player One Win' && user.userId === game.playerOneId) game.outcome = 'Victory' 
                            if (game.status === 'Player One Win' && user.userId !== game.playerOneId) game.outcome = 'Defeat' 
                            if (game.status === 'Player Two Win' && user.userId === game.playerTwoId) game.outcome = 'Victory' 
                            if (game.status === 'Player Two Win' && user.userId !== game.playerTwoId) game.outcome = 'Defeat' 
                            if (game.status === 'Tie') game.outcome = 'Tie' 

							accumulator.push(game);
						}

						return accumulator;
					}, []);
					setGames(filteredGamesWithVictory);
				} else {
					const filteredGames = gameArray.filter((game) => {
						return game.status === "In Progress" || game.status === "New";
					});
					setGames(filteredGames);
				}
			} catch (err) {
				console.error(err);
			}
		};

		if (user) {
			fetchGames();
		}
	}, [user, course, masterList, history]);

	return (
		<div className={divClass}>
			{title && <h2 display="inline">{title}</h2>}
			{games && games.map((g) => <Game game={g} history={history} key={g.gameId} />)}
		</div>
	);
};

export default GameList;
