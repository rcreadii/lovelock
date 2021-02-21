import { authenticate } from "./services/auth";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import React, { useEffect, useState } from "react";
import MetaTags from "react-meta-tags";

import Footer from "./components/Footer/Footer";
import JoinLock from "./components/JoinLock/JoinLock";
import Link from "./components/Link/Link";
import LoginForm from "./components/auth/LoginForm";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SignUpForm from "./components/auth/SignUpForm";
import Lock from "./components/Lock/Lock";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await authenticate();
      if (!user.errors) {
        setAuthenticated(true);
        setUser(user);
      }
      setLoaded(true);
    })();
  }, []);

  if (!loaded) {
    return null;
  }

  

  return (
    <>
      <BrowserRouter>
        <NavBar
          authenticated={authenticated}
          setAuthenticated={setAuthenticated}
          setUser={setUser}
        />
        <Switch>
          <Route path="/login" exact={true}>
            <LoginForm
              authenticated={authenticated}
              setAuthenticated={setAuthenticated}
              setUser={setUser}
            />
          </Route>
          <Route path="/sign-up" exact={true}>
            <SignUpForm
              authenticated={authenticated}
              setAuthenticated={setAuthenticated}
              setUser={setUser}
            />
          </Route>
          <Route path="/lock/join">
            <JoinLock />
          </Route>
          <Route path="/lock/:lockId">
            <Lock user={user} />
          </Route>
          <ProtectedRoute path="/" authenticated={authenticated}>
            <Link setUser={setUser} user={user} />
          </ProtectedRoute>
        </Switch>
        <Footer />
      </BrowserRouter>
      <MetaTags>
        <meta name="viewport" content={`width=${window.screen.width * 1.25}`} />
      </MetaTags>
    </>
  );
}

export default App;
