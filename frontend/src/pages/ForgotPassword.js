import { useState } from "react";
import { useAuthContext } from "../hooks/UseAuthContext";

import "../css/general.css";
import "../css/generalAssets.css";
import "../css/forgotPassword.css";

const ForgotPassword = () => {
	const { dispatch } = useAuthContext();

	const [resetForm, setResetForm] = useState({
		email: "",
	});

	const [resetError, setResetError] = useState();

	const handleResetChange = (e) => {
		const { name, value } = e.target;
		setResetForm({
			...resetForm,
			[name]: value,
		});
	};

	const handleResetSubmit = async (e) => {
		e.preventDefault();
		setResetError("");
	};
	return (
		<div className="forgot-password-page-container">
			<div className="forgot-password-container">
				<div className="forgot-password-form-container">
					<h2>Reset Password</h2>
					<form className="forgot-password-form" onSubmit={handleResetSubmit}>
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={resetForm.email}
							onChange={handleResetChange}
							required
						/>
						<button type="submit" className="standard-button">
							Request Password Reset
						</button>
						{resetError ? <p className="form-error">{resetError}</p> : null}
					</form>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
