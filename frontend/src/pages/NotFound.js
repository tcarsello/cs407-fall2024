import "../css/general.css";
import "../css/notFound.css";
import "../css/generalAssets.css";

const NotFound = () => {
	return (
		<div className="not-found-container">
			<h1>404 Not Found</h1>
			<a className="standard-button" href="/">
				Back To Home
			</a>
		</div>
	);
};

export default NotFound;
