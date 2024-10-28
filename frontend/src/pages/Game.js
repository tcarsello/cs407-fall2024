import { GameProvider, useGameContext} from "../context/GameContext"
import { CourseProvider, useCourseContext } from "../context/CourseContext"
import { useAuthContext } from "../hooks/UseAuthContext"

const Game = () => {

    return (
        <CourseProvider>
            <GameProvider>
                <GameComponent />
            </GameProvider>
        </CourseProvider>
    )

}

const GameComponent = () => {

    const { user } = useAuthContext()
    const { course } = useCourseContext()
    const { game } = useGameContext()

    return (
        <div>Game {game?.gameId} Course {course?.courseId} User {user?.userId}</div>
    )

}

export default Game
