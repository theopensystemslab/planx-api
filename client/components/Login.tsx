import axios from "axios";
import * as React from "react";

type State = {
  username: string;
  password: string;
};

class Login extends React.Component<{}, State> {
  readonly state: State = {
    username: "",
    password: ""
  };

  updateField = (field: "username" | "password") => (event): void => {
    this.setState({ [field]: event.target.value } as State);
  };

  handleSubmit = async event => {
    event.preventDefault();
    const req = await axios.post(
      "http://localhost:3001/auth/login",
      this.state
    );
    console.log(req.data);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Login
        <input
          placeholder="username"
          type="text"
          value={this.state.username}
          onChange={this.updateField("username")}
        />
        <input
          placeholder="password"
          type="password"
          value={this.state.password}
          onChange={this.updateField("password")}
        />
        <button>Submit</button>
      </form>
    );
  }
}

export default Login;
