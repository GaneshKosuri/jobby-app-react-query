import {createMemoryHistory} from 'history'
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import {Router, BrowserRouter} from 'react-router-dom'

import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Cookies from 'js-cookie'
import App from '../App'

const websiteLogo = 'https://assets.ccbp.in/frontend/react-js/logo-img.png'
const loginRoutePath = '/login'
const homeRoutePath = '/'
const jobsRoutePath = '/jobs'

let historyInstance
const mockHistoryReplace = instance => {
  jest.spyOn(instance, 'replace')
}

const mockGetCookie = (returnToken = true) => {
  let mockedGetCookie
  if (returnToken) {
    mockedGetCookie = jest.fn(() => ({
      jwt_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhaHVsIiwicm9sZSI6IlBSSU1FX1VTRVIiLCJpYXQiOjE2MTk2Mjg2MTN9.nZDlFsnSWArLKKeF0QbmdVfLgzUbx1BGJsqa2kc_21Y',
    }))
  } else {
    mockedGetCookie = jest.fn(() => undefined)
  }
  jest.spyOn(Cookies, 'get')
  Cookies.get = mockedGetCookie
}

const restoreGetCookieFns = () => {
  Cookies.get.mockRestore()
}
const mockRemoveCookie = () => {
  jest.spyOn(Cookies, 'remove')
  Cookies.remove = jest.fn()
}
const restoreRemoveCookieFns = () => {
  Cookies.remove.mockRestore()
}
const rtlRender = (ui = <App />, path = '/') => {
  historyInstance = createMemoryHistory()
  historyInstance.push(path)
  render(<Router history={historyInstance}>{ui}</Router>)
  return {
    history: historyInstance,
  }
}

const jobsResponse = {
  jobs: [
    {
      id: 101,
      title: 'Software Developer',
      rating: 202,
      company_name: 'Amazon',
      location: 'Hyderabad',
      employment_type: 'FULLTIME',
      job_description:
        'Amazon Lex is a platform for building conversational interfaces into any application. It provides the advanced deep learning functionalities of automatic speech recognition (ASR) for converting speech to text and natural language understanding (NLU) to recognize the intent of the text. Be a part of a well-balanced team with diverse experience.',
      package_per_annum: '25 LPA',
      company_logo_url:
        'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
    },
    {
      id: 102,
      title: 'Hardware Developer',
      rating: 206,
      company_name: 'Amazon',
      location: 'Delhi',
      employment_type: 'PARTTIME',
      job_description:
        'Amazon Lex is a platform for building into any application. It provides the advanced deep learning functionalities of automatic speech recognition (ASR) for converting speech to text and natural language understanding (NLU) to recognize the intent of the text. Be a part of a well-balanced team with diverse experience.',
      package_per_annum: '26 LPA',
      company_logo_url:
        'https://assets.ccbp.in/frontend/react-js/jobby-app/facebook-img.png',
    },
  ],
  total: 2,
}

const profileResponse = {
  profile_details: {
    name: 'Rahul Attuluri',
    profile_image_url:
      'https://assets.ccbp.in/frontend/react-js/male-avatar-img.png',
    short_bio: 'Lead Hardware Developer and AI-ML expert',
  },
}

const renderWithBrowserRouter = (ui, {route = '/'} = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(ui, {wrapper: BrowserRouter})
}
const profileApiUrl = 'https://apis.ccbp.in/profile'
const jobsApiUrl = 'https://apis.ccbp.in/jobs'

const handlers = [
  rest.get(profileApiUrl, (req, res, ctx) => res(ctx.json(profileResponse))),
  rest.get(jobsApiUrl, (req, res, ctx) => res(ctx.json(jobsResponse))),
]

const server = setupServer(...handlers)

describe('Home Route Tests', () => {
  beforeAll(() => {
    server.listen()
  })

  afterAll(() => {
    server.close()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  it('When "/" is provided as the URL path by an unauthenticated user, then the page should be navigated to the Login Route and consist of an HTML button element with text content as "Login":::5:::', () => {
    mockGetCookie(false)
    renderWithBrowserRouter(<App />)
    expect(window.location.pathname).toBe(loginRoutePath)
    const loginButton = screen.getByRole('button', {
      name: /Login/i,
    })
    expect(loginButton).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When "/" is provided as the URL path by an authenticated user, then the page should be navigated to the Home Route and consist of an HTML main heading element with text content as "Find The Job That Fits Your Life":::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      screen.getByRole('heading', {
        name: /Find The Job That Fits Your Life/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Home Route should consist of an HTML image element with alt attribute value as "website logo" and src as the given website logo image URL:::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const imageEls = screen.getAllByRole('img', {
      name: /website logo/i,
    })
    expect(imageEls[0]).toBeInTheDocument()
    expect(imageEls[0].src).toBe(websiteLogo)
    restoreGetCookieFns()
  })

  it('Home Route should consist of an HTML image element with alt attribute value as "website logo" and src as the given website logo image URL is wrapped with Link from react-router-dom:::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      screen.getAllByRole('link', {
        name: /website logo/,
      })[0],
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Home Route should consist of at least one HTML unordered list element to display the list of nav items in the Header:::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const unorderedListEl = screen.getAllByRole('list')
    expect(unorderedListEl.length).toBeGreaterThanOrEqual(1)
    expect(unorderedListEl[0].tagName).toBe('UL')
    restoreGetCookieFns()
  })

  it('Home Route should consist of at least three HTML list elements to display the nav items in the Header:::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3)
    restoreGetCookieFns()
  })

  it('Home Route should consist of a Link from react-router-dom with text content as "Home":::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      screen.getByRole('link', {
        name: /Home/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Home Route should consist of a Link from react-router-dom with text content as "Jobs":::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      screen.getByRole('link', {
        name: /^Jobs$/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Home Route should consist of an HTML button element with text content as "Logout":::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      screen.getByRole('button', {
        name: /Logout/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Home Route should consist of an HTML main heading element with text content as "Find The Job That Fits Your Life":::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      screen.getByRole('heading', {
        name: /Find The Job That Fits Your Life/i,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Home Route should consist of an HTML paragraph element with text content starting with "Millions of people are searching for jobs":::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const paragraphEl = screen.getByText(
      /^Millions of people are searching for jobs/i,
    )
    expect(paragraphEl).toBeInTheDocument()
    expect(paragraphEl.tagName).toBe('P')
    restoreGetCookieFns()
  })

  it('Home Route should consist of an HTML button element with text content as "Find Jobs":::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      screen.getByRole('button', {
        name: /Find Jobs/,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('Home Route should consist of an HTML button element with text content as "Find Jobs" is wrapped with Link from react-router-dom:::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    expect(
      screen.getByRole('link', {
        name: /Find Jobs/,
      }),
    ).toBeInTheDocument()
    restoreGetCookieFns()
  })

  it('When the Find Jobs button in the Home Route is clicked, then the page should be navigated to Jobs Route:::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const findJobsBtn = screen.getByRole('button', {
      name: /Find Jobs/i,
    })
    userEvent.click(findJobsBtn)
    expect(window.location.pathname).toBe(jobsRoutePath)
    restoreGetCookieFns()
  })

  it('When the Jobs link in the Header is clicked, then the page should be navigated to Jobs Route:::5:::', () => {
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const jobsLink = screen.getByRole('link', {
      name: /^jobs$/i,
    })
    userEvent.click(jobsLink)
    expect(window.location.pathname).toBe(jobsRoutePath)
    restoreGetCookieFns()
  })

  it('When the Logout button in the Header is clicked, then the Cookies.remove() method should be called with the argument as "jwt_token":::5:::', () => {
    mockRemoveCookie()
    mockGetCookie()
    renderWithBrowserRouter(<App />)
    const logoutBtn = screen.getByRole('button', {
      name: /Logout/i,
    })
    userEvent.click(logoutBtn)
    expect(Cookies.remove).toHaveBeenCalledWith('jwt_token')
    restoreRemoveCookieFns()
    restoreGetCookieFns()
  })

  it('When the Logout button in the Header is clicked, the history.replace() method should be called with the argument as "/login":::5:::', () => {
    mockRemoveCookie()
    mockGetCookie()
    const {history} = rtlRender(<App />, homeRoutePath)
    mockHistoryReplace(history)
    const logoutBtn = screen.getByRole('button', {
      name: /Logout/i,
    })
    userEvent.click(logoutBtn)
    expect(history.replace).toHaveBeenCalledWith(loginRoutePath)
    restoreRemoveCookieFns()
    restoreGetCookieFns()
  })

  it('When the Logout button in the Header is clicked, then the page should be navigated to the Login Route:::5:::', () => {
    mockGetCookie()
    mockRemoveCookie()
    renderWithBrowserRouter(<App />)
    const logoutBtn = screen.getByRole('button', {
      name: /Logout/i,
    })
    restoreGetCookieFns()
    mockGetCookie(false)
    userEvent.click(logoutBtn)
    expect(window.location.pathname).toBe(loginRoutePath)
    restoreRemoveCookieFns()
    restoreGetCookieFns()
  })
})
