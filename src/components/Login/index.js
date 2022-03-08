import {useState} from 'react'
import Cookies from 'js-cookie'
import {Redirect, useHistory} from 'react-router-dom'
import {useMutation} from 'react-query'

import './index.css'

const onLoginSuccess = (response, history) => {
  Cookies.set('jwt_token', response.jwt_token, {
    expires: 30,
    path: '/',
  })
  history.replace('/')
}

const Login = () => {
  const history = useHistory()
  const [userNameInput, setUserNameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')

  const {mutate, isError, error} = useMutation(
    async userDetails => {
      const url = 'https://apis.ccbp.in/login'
      const options = {
        method: 'POST',
        body: JSON.stringify(userDetails),
      }
      const response = await fetch(url, options)
      return response.json()
    },
    {
      onSuccess: response => onLoginSuccess(response, history),
    },
  )

  const onChangeUsername = event => {
    setUserNameInput(event.target.value)
  }

  const onChangePassword = event => {
    setPasswordInput(event.target.value)
  }

  const submitForm = async event => {
    event.preventDefault()
    const userDetails = {username: userNameInput, password: passwordInput}
    mutate(userDetails)
  }

  const renderPasswordField = () => (
    <>
      <label className="input-label" htmlFor="passwordInput">
        PASSWORD
      </label>
      <input
        type="password"
        id="passwordInput"
        className="input-field"
        value={passwordInput}
        onChange={onChangePassword}
        placeholder="Password"
      />
    </>
  )

  const renderUsernameField = () => (
    <>
      <label className="input-label" htmlFor="userNameInput">
        USERNAME
      </label>
      <input
        type="text"
        id="userNameInput"
        className="input-field"
        value={userNameInput}
        onChange={onChangeUsername}
        placeholder="Username"
      />
    </>
  )

  const jwtToken = Cookies.get('jwt_token')
  if (jwtToken !== undefined) {
    return <Redirect to="/" />
  }

  return (
    <div className="login-form-container">
      <form className="form-container" onSubmit={submitForm}>
        <img
          src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
          className="login-website-logo"
          alt="website logo"
        />
        <div className="input-container">{renderUsernameField()}</div>
        <div className="input-container">{renderPasswordField()}</div>
        <button className="login-button" type="submit">
          Login
        </button>
        {isError && <p className="error-message">*{error.message}</p>}
      </form>
    </div>
  )
}

export default Login
