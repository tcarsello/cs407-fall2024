import { useState } from "react";
import { useAuthContext } from "../hooks/UseAuthContext";

import "../css/general.css";
import "../css/generalAssets.css";
import "../css/forgotPassword.css";
import { createSearchParams, useNavigate, useSearchParams } from "react-router-dom";

const OneTimeCode = () => {
	const { dispatch } = useAuthContext();
	const navigate = useNavigate();

	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");

	const [codeForm, setCodeForm] = useState({
		token: "",
	});

	const [codeError, setCodeError] = useState();

	const handleCodeChange = (e) => {
		const { name, value } = e.target;
		setCodeForm({
			...codeForm,
			[name]: value,
		});
	};

	const handleCodeSubmit = async (e) => {
		e.preventDefault();
		const response = await fetch(`/api/user/verify-token`, {
			method: "POST",
			body: JSON.stringify(codeForm),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const json = await response.json();
		if (!response.ok) {
			setCodeError(json.error.toString());
			return;
		}

		setCodeError("");

		try {
			navigate({
				search: createSearchParams({
					token: codeForm.token,
				}).toString(),
			});
		} catch (err) {
			console.log(err);
		}
	};

	const [passResetForm, setPassResetForm] = useState({
		password: "",
		confirmPassword: "",
	});

	const [passResetError, setPassResetError] = useState();

	const handlePassResetChange = (e) => {
		const { name, value } = e.target;
		setPassResetForm({
			...passResetForm,
			[name]: value,
		});
	};

	const handlePassResetSubmit = async (e) => {
		e.preventDefault();

		if (passResetForm.password !== passResetForm.confirmPassword) {
			setPassResetError("Passwords do not match!");
			return;
		}

		const response = await fetch(`/api/user/reset`, {
			method: "POST",
			body: JSON.stringify({ token: token, password: passResetForm.password }),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const json = await response.json();
		if (!response.ok) {
			setPassResetError(json.error.toString());
			return;
		}

		setPassResetError("");

		localStorage.setItem("user", JSON.stringify(json));
		dispatch({ type: "LOGIN", payload: json });
	};

	if (!token) {
		return (
			<div className="forgot-password-page-container">
				<div className="forgot-password-container">
					<div className="forgot-password-form-container">
						<h2>One Time Code Login</h2>
						<form className="forgot-password-form" onSubmit={handleCodeSubmit}>
							<input
								type="text"
								name="token"
								placeholder="One Time Code"
								value={codeForm.token}
								onChange={handleCodeChange}
								required
							/>
							<button type="submit" className="standard-button">
								Submit
							</button>
							{codeError ? <p className="form-error">{codeError}</p> : null}
						</form>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="forgot-password-page-container">
			<div className="forgot-password-container">
				<div className="forgot-password-form-container">
					<h2>Reset Password</h2>
					<form className="forgot-password-form" onSubmit={handlePassResetSubmit}>
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={passResetForm.password}
							onChange={handlePassResetChange}
							required
						/>
						<input
							type="password"
							name="confirmPassword"
							placeholder="Confirm Password"
							value={passResetForm.confirmPassword}
							onChange={handlePassResetChange}
							required
						/>
						<button type="submit" className="standard-button">
							Reset My Password
						</button>
						{passResetError ? <p className="form-error">{passResetError}</p> : null}
					</form>
				</div>
			</div>
		</div>
	);
};

export default OneTimeCode;
