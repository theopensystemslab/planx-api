import axios from "axios";
import * as React from "react";

type Props = {
  text: string;
  endpoint: string;
};

type State = {
  username: string;
  password: string;
};

class UserForm extends React.Component<Props, State> {
  readonly state: State = {
    username: "",
    password: ""
  };

  updateField = (field: "username" | "password") => (event): void => {
    this.setState({ [field]: event.target.value } as State);
  };

  handleSubmit = async event => {
    event.preventDefault();
    const { REST_API_PORT } = process.env;
    const url = `http://localhost:${REST_API_PORT}/${this.props.endpoint}`;
    const req = await axios.post(url, this.state);
    console.log(req.data);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
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
        <button>{this.props.text}</button>
      </form>
    );
  }
}

export default UserForm;
