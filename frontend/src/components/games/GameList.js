import { useAuthContext } from "../../hooks/UseAuthContext";

import { useState, useEffect } from "react";

const GameList = ({ masterList = false, courseId = null }) => {
	const user = useAuthContext();

	const [Games, setGames] = useState([]);

	useEffect(() => {
		const fetchGames = async () => {
			try {
				const response = await fetch(`/api/user/${user.userId}/games/${courseId}`, {
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
	}, [user, courseId]);
};

export default GameList;
