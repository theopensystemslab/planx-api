require('dotenv').config({ path: '../.env' })

import { Observer } from 'mobx-react-lite'
import * as React from 'react'
import { render } from 'react-dom'
import 'setimmediate'
import UserForm from './components/UserForm'
import Auth from './models/auth'

function ObserveAuth(props) {
  const auth = Auth.create({})
  return (
    <Observer>
      {() => {
        if (auth.loggedIn) {
          return (
            <div>
              <h1>{auth.username}</h1>
              <button onClick={auth.logout}>Log out</button>
            </div>
          )
        } else {
          return (
            <div>
              <UserForm text="Log in" fn={auth.login} />
              <UserForm text="Sign up" fn={auth.signup} />
            </div>
          )
        }
      }}
    </Observer>
  )
}

render(<ObserveAuth />, document.getElementById('client'))
