import {createMemoryHistory} from 'history'
import {BrowserRouter, Router} from 'react-router-dom'
import Cookies from 'js-cookie'

import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {setupServer} from 'msw/node'
import {rest} from 'msw'

import App from '../App'

const websiteLogo = 'https://assets.ccbp.in/frontend/react-js/logo-img.png'

const loginRoutePath = '/login'
const homeRoutePath = '/'

const loginSuccessResponse = {
  jwt_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhaHVsIiwiaWF0IjoxNjE5MDk0MjQxfQ.1i6BbQkQvtvpv72lHPNbl2JOZIB03uRcPbchYYCkL9o',
}

const passwordIncorrect = {
  error_msg: "Username and Password didn't match",
}

const invalidUser = {
  error_msg: 'invalid username',
}

const invalidInputs = {
  error_msg: 'Username or password is invalid',
}

const loginApiUrl = 'https://apis.ccbp.in/login'

const server = setupServer(
  rest.post(loginApiUrl, (req, res, ctx) => {
    const {username, password} = JSON.parse(req.body)

    if (
      username === '' ||
      password === '' ||
      username === undefined ||
      password === undefined
    )
      return res(ctx.status(400, 'invalid request'), ctx.json(invalidInputs))
    else if (username === 'rahul' && password === 'rahul@2021')
      return res(ctx.json(loginSuccessResponse))
    else if (username === 'rahul' && password !== 'rahul@2021')
      return res(
        ctx.status(401, 'invalid request'),
        ctx.json(passwordIncorrect),
      )
    else return res(ctx.status(404, 'invalid request'), ctx.json(invalidUser))
  }),
)

let historyInstance
const mockHistoryReplace = instance => {
  jest.spyOn(instance, 'replace')
}

const restoreHistoryReplace = instance => {
  instance.replace.mockRestore()
}

const mockSetCookie = () => {
  jest.spyOn(Cookies, 'set')
  Cookies.set = jest.fn()
}

const restoreSetCookieFns = () => {
  Cookies.set.mockRestore()
}

const mockGetCookie = () => {
  const mockedGetCookie = jest.fn(() => ({
    jwt_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhaHVsIiwiaWF0IjoxNjE5MDk0MjQxfQ.1i6BbQkQvtvpv72lHPNbl2JOZIB03uRcPbchYYCkL9o',
  }))
  jest.spyOn(Cookies, 'get')
  Cookies.get = mockedGetCookie
}

const restoreGetCookieFns = () => {
  Cookies.get.mockRestore()
}

const rtlRender = (ui = <App />, path = loginRoutePath) => {
  historyInstance = createMemoryHistory()
  historyInstance.push(path)
  const {container} = render(<Router history={historyInstance}>{ui}</Router>)
  return {
    history: historyInstance,
    container,
  }
}

const renderWithBrowserRouter = (ui, {route = loginRoutePath} = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(ui, {wrapper: BrowserRouter})
}

const originalFetch = window.fetch

describe('Login Route Tests', () => {
  beforeAll(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    window.fetch = originalFetch
  })
  afterAll(() => {
    server.close()
  })

  it('When "/login" is provided as the URL path by an unauthenticated user, then the page should be navigated to the Login Route and consist of an HTML button element with text content as "Login":::5:::', () => {
    renderWithBrowserRouter(<App />)
    expect(window.location.pathname).toBe(loginRoutePath)
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
    })
    expect(loginButton).toBeInTheDocument()
  })

  it('When "/login" is provided as the URL path by an authenticated user, then the page should be navigated to the Home Route and consist of an HTML main heading element with text content as "Find The Job That Fits Your Life":::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      screen.getByRole('heading', {
        name: /Find The Job That Fits Your Life/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Login Route should consist of an HTML form element:::5:::', () => {
    const {container} = renderWithBrowserRouter(<App />)
    const formEl = container.querySelector('form')
    expect(formEl).toBeInTheDocument()
  })

  it('Login Route should consist of an HTML image element with alt attribute "website logo" and src as the given website logo image URL:::5:::', () => {
    renderWithBrowserRouter(<App />)
    const imageEl = screen.getByRole('img', {name: /website logo/i})
    expect(imageEl).toBeInTheDocument()
    expect(imageEl.src).toBe(websiteLogo)
  })

  it('Login Route should consist of an HTML input element with label text as "USERNAME":::5:::', () => {
    renderWithBrowserRouter(<App />)
    expect(screen.getByLabelText(/USERNAME/i)).toBeInTheDocument()
  })

  it('Login Route should consist of an HTML input element with label text as "USERNAME" and type attribute value as "text":::5:::', () => {
    renderWithBrowserRouter(<App />)
    expect(screen.getByLabelText(/USERNAME/i).type).toBe('text')
  })

  it('Login Route should consist of an HTML input element with label text as "PASSWORD":::5:::', () => {
    renderWithBrowserRouter(<App />)
    expect(screen.getByLabelText(/PASSWORD/i)).toBeInTheDocument()
  })

  it('Login Route should consist of an HTML input element with label text as "PASSWORD" and type attribute value as "password":::5:::', () => {
    renderWithBrowserRouter(<App />)
    expect(screen.getByLabelText(/PASSWORD/i).type).toBe('password')
  })

  it('Login Route should consist of an HTML button element with text content as "Login" and type attribute value as "submit":::5:::', () => {
    renderWithBrowserRouter(<App />)
    const buttonEl = screen.getByRole('button', {name: /Login/i})
    expect(buttonEl).toBeInTheDocument()
    expect(buttonEl.type).toBe('submit')
  })

  it('When a non-empty value is provided in the HTML input element with the label text as "USERNAME", then the value provided should be displayed in the HTML input element:::5:::', () => {
    renderWithBrowserRouter(<App />)
    const inputEl = screen.getByLabelText(/USERNAME/i)
    userEvent.type(inputEl, 'rahul')
    expect(inputEl).toHaveValue('rahul')
  })

  it('When a non-empty value is provided in the HTML input element with the label text as "PASSWORD", then the value provided should be displayed in the HTML input element:::5:::', () => {
    renderWithBrowserRouter(<App />)
    const inputEl = screen.getByLabelText(/PASSWORD/i)
    userEvent.type(inputEl, 'rahul@2021')
    expect(inputEl).toHaveValue('rahul@2021')
  })

  it('When non-empty values are provided for username and password input and the Login button is clicked, an HTTP POST request should be made to the given Login API URL:::5:::', () => {
    const mockFetchFunction = jest.fn().mockImplementation(() => ({
      ok: true,
      json: () => Promise.resolve(loginSuccessResponse),
    }))
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/PASSWORD/i, {
      exact: false,
    })
    userEvent.type(usernameField, 'test')
    userEvent.type(passwordField, 'test@2021')
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    userEvent.click(loginButton)
    expect(mockFetchFunction.mock.calls[0][0]).toMatch(`${loginApiUrl}`)
  })

  it('When non-empty values are provided for username and password input and the Login button is clicked, then an HTTP POST request should be made to the given Login API URL with request object containing the keys "username" and "password" with the values provided respectively:::5:::', () => {
    const mockFetchFunction = jest.fn().mockImplementation(() => ({
      ok: true,
      json: () => Promise.resolve({message: 'invalid credentials'}),
    }))
    window.fetch = mockFetchFunction
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    userEvent.type(usernameField, 'test')
    userEvent.type(passwordField, 'test@2021')
    userEvent.click(loginButton)
    const {username, password} = JSON.parse(
      mockFetchFunction.mock.calls[0][1].body,
    )
    expect(username).toBe('test')
    expect(password).toBe('test@2021')
  })

  it('When username and password are empty and the Login button is clicked, then the page should consist of an HTML paragraph element with text content as error message received from the response and the page should not be navigated:::5:::', async () => {
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    userEvent.type(usernameField, '')
    userEvent.type(passwordField, '')
    userEvent.click(loginButton)
    const paragraphEl = await screen.findByText(
      /Username or password is invalid/i,
      {
        exact: false,
      },
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    expect(window.location.pathname).toBe(loginRoutePath)
  })

  it('when a non-empty password is provided and the Login button is clicked with an empty username, then the page should consist of an HTML paragraph element with text content as error message received from the response and the page should not be navigated:::5:::', async () => {
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    userEvent.type(usernameField, '')
    userEvent.type(passwordField, 'rahul')
    userEvent.click(loginButton)
    const paragraphEl = await screen.findByText(
      /Username or password is invalid/i,
      {
        exact: false,
      },
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    expect(window.location.pathname).toBe(loginRoutePath)
  })

  it('when a non-empty username is provided and the Login button is clicked with an empty password, then the page should consist of an HTML paragraph element with text content as error message received from the response and the page should not be navigated:::5:::', async () => {
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    expect(window.location.pathname).toBe('/login')
    userEvent.type(usernameField, 'test')
    userEvent.type(passwordField, '')
    userEvent.click(loginButton)
    const paragraphEl = await screen.findByText(
      /Username or password is invalid/i,
      {
        exact: false,
      },
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    expect(window.location.pathname).toBe(loginRoutePath)
  })

  it('when invalid username and password are provided and the Login button is clicked, then the page should consist of an HTML paragraph element with text content as error message received from the response and the page should not be navigated:::5:::', async () => {
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    expect(window.location.pathname).toBe('/login')
    userEvent.type(usernameField, 'unknown')
    userEvent.type(passwordField, 'unknown@2021')
    userEvent.click(loginButton)
    expect(
      await screen.findByText(/invalid username/i, {
        exact: false,
      }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe(loginRoutePath)
  })

  it('when an invalid username and valid password are provided and the Login button is clicked, then the page should consist of an HTML paragraph element with text content as an error message received from the response and the page should not be navigated:::5:::', async () => {
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    expect(window.location.pathname).toBe('/login')
    userEvent.type(usernameField, 'unknown')
    userEvent.type(passwordField, 'rahul@2021')
    userEvent.click(loginButton)
    expect(
      await screen.findByText(/invalid username/i, {
        exact: false,
      }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe(loginRoutePath)
  })

  it('when a valid username and an invalid password are provided and the Login button is clicked, then the page should consist of an HTML paragraph element with text content as error message received from the response and the page should not be navigated:::5:::', async () => {
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    expect(window.location.pathname).toBe('/login')
    userEvent.type(usernameField, 'rahul')
    userEvent.type(passwordField, 'rahul')
    userEvent.click(loginButton)
    expect(
      await screen.findByText(/username and password didn't match/i, {
        exact: false,
      }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe(loginRoutePath)
  })

  it('When valid username and password are provided and the Login button is clicked, then the Cookies.set() method should be called with three arguments - "jwt_token" string as the first argument, JWT token value as the second argument, and expiry days as the third argument:::5:::', async () => {
    mockSetCookie()
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    userEvent.type(usernameField, 'rahul')
    userEvent.type(passwordField, 'rahul@2021')
    userEvent.click(loginButton)
    await waitFor(() =>
      expect(Cookies.set).toHaveBeenCalledWith(
        'jwt_token',
        loginSuccessResponse.jwt_token,
        expect.objectContaining({expires: expect.any(Number)}),
      ),
    )
    restoreSetCookieFns()
  })

  it('When valid username and password are provided and the Login button is clicked, then the history.replace() method should be called with the argument "/":::5:::', async () => {
    const {history} = rtlRender(<App />)
    mockHistoryReplace(history)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordFields = screen.getByLabelText(/^PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    userEvent.type(usernameField, 'rahul')
    userEvent.type(passwordFields, 'rahul@2021')
    userEvent.click(loginButton)
    await waitFor(() => expect(history.replace).toHaveBeenCalledWith('/'))
    restoreHistoryReplace(history)
  })

  it('When valid username and password are provided and the login button is clicked, then the page should be navigated to the Home Route:::5:::', async () => {
    renderWithBrowserRouter(<App />)
    const usernameField = screen.getByLabelText(/USERNAME/i, {
      exact: false,
    })
    const passwordField = screen.getByLabelText(/^PASSWORD/i, {
      exact: false,
    })
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
      exact: false,
    })
    userEvent.type(usernameField, 'rahul')
    userEvent.type(passwordField, 'rahul@2021')
    userEvent.click(loginButton)
    mockGetCookie()
    await waitFor(() => expect(window.location.pathname).toBe(homeRoutePath))
    restoreGetCookieFns()
  })
})
