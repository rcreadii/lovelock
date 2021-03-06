import { Button, Image, Input, Label, Form, Grid } from "semantic-ui-react";
import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { signUp } from "../../services/auth";

const SignUpForm = ({ authenticated, isMobile, setAuthenticated, setUser }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState([]);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [middleOrTop, setMiddleOrTop] = useState("top");

  const [viewHeight, setViewHeight] = useState("74.5vh");
  useEffect(() => {
    if (isMobile === false) {
      setViewHeight("86.5vh");
      setMiddleOrTop("middle");
    }
  }, []);

  const onSignUp = async (e) => {
    e.preventDefault();
    if (password === repeatPassword) {
      const user = await signUp(username, email, password);
      if (!user.errors) {
        setAuthenticated(true);
        setUser(user);
      } else {
        setErrors(user.errors);
      }
    } else {
      const err = "password: passwords do not match";
      setErrors([err]);
    }
  };

  const updateUsername = (e) => {
    setUsername(e.target.value);
  };

  const updateEmail = (e) => {
    setEmail(e.target.value);
  };

  const updatePassword = (e) => {
    setPassword(e.target.value);
  };

  const updateRepeatPassword = (e) => {
    setRepeatPassword(e.target.value);
  };

  if (authenticated) {
    return <Redirect to="/" />;
  }

  return (
    <Grid
      style={{ height: viewHeight, margin: "0px" }}
      verticalAlign={middleOrTop}
    >
      <Grid.Column textAlign="center">
        <Image
          src="https://lovelock-assets.s3.amazonaws.com/image-assets/welcome.png"
          alt="image"
          verticalAlign="middle"
          size="small"
        />
        <Form onSubmit={onSignUp}>
          <Form.Field inline>
            <Input
              type="text"
              name="username"
              placeholder="username"
              onChange={updateUsername}
              value={username}
              required={true}
              size="big"
            />
          </Form.Field>
          <Form.Field inline>
            {/* <label>Email</label> */}
            <Input
              type="email"
              name="email"
              placeholder="email"
              onChange={updateEmail}
              value={email}
              required={true}
              size="big"
            />
          </Form.Field>
          <Form.Field inline>
            <Input
              type="password"
              name="password"
              placeholder="password"
              onChange={updatePassword}
              value={password}
              required={true}
              size="big"
            />
          </Form.Field>
          <Form.Field inline>
            <Input
              type="password"
              name="repeat_password"
              placeholder="repeat password"
              onChange={updateRepeatPassword}
              value={repeatPassword}
              required={true}
              size="big"
            />
            {errors.map((error) => {
              if (error.includes("password")) {
                return (
                  <Label pointing prompt size="large">
                    {error}
                  </Label>
                );
              } else {
                return null;
              }
            })}
          </Form.Field>
          <Button color="purple" inverted size="big" type="submit">
            Sign Up
          </Button>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default SignUpForm;
