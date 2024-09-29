import { useState } from "react";

import "../css/general.css";
import "../css/generalAssets.css";
import "../css/forgotPassword.css";

const ForgotPassword = () => {
	const [forgotForm, setForgotForm] = useState({
		email: "",
	});

	const [forgotError, setForgotError] = useState();
	const [successMessage, setSuccessMessage] = useState();

	const handleForgotChange = (e) => {
		const { name, value } = e.target;
		setForgotForm({
			...forgotForm,
			[name]: value,
		});
	};

	const handleForgotSubmit = async (e) => {
		e.preventDefault();
		const response = await fetch(`/api/user/forgot-password`, {
			method: "POST",
			body: JSON.stringify(forgotForm),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const json = await response.json();
		if (!response.ok) {
			setSuccessMessage("");
			setForgotError(json.error);
			return;
		}

		setForgotError("");
		setSuccessMessage(json.message);
	};
	return (
		<div className="forgot-password-page-container">
			<div className="forgot-password-container">
				<div className="forgot-password-form-container">
					<h2>Recover Account</h2>
					<form className="forgot-password-form" onSubmit={handleForgotSubmit}>
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={forgotForm.email}
							onChange={handleForgotChange}
							required
						/>
						<button type="submit" className="standard-button">
							Send Recover Request
						</button>
						{forgotError ? <p className="form-error">{forgotError}</p> : null}
						{successMessage ? <p className="form-worked-message">{successMessage}</p> : null}
					</form>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
