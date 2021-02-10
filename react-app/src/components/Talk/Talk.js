import React, { useState } from "react";

export default function Talk() {
  const [bearing, setBearing] = useState(null);
  const [geolocation, setGeolocation] = useState();

  const [linkedCompassDirection, setLinkedCompassDirection] = useState();
  const [myCompassDirection, setMyCompassDirection] = useState();

  const initiatorOrJoiner = sessionStorage.getItem("initiatorOrJoiner");
  const talkId = sessionStorage.getItem("talkId");
  const userId = sessionStorage.getItem("userId");

  const calculateBearing = (geolocationData) => {
    let myLat;
    let myLong;
    let theirLat;
    let theirLong;

    if (initiatorOrJoiner === "initiator") {
      myLat = geolocationData.initiatorGPSLatitude;
      myLong = geolocationData.initiatorGPSLongitude;
      theirLat = geolocationData.joinerGPSLatitude;
      theirLong = geolocationData.joinerGPSLongitude;
    } else {
      myLat = geolocationData.joinerGPSLatitude;
      myLong = geolocationData.joinerGPSLongitude;
      theirLat = geolocationData.initiatorGPSLatitude;
      theirLong = geolocationData.initiatorGPSLongitude;
    }

    // do we lose any precision here?
    myLat = parseFloat(myLat);
    myLong = parseFloat(myLong);
    theirLat = parseFloat(theirLat);
    theirLong = parseFloat(theirLong);

    const R = 6371e3;
    const φ1 = (myLat * Math.PI) / 180;
    const φ2 = (theirLat * Math.PI) / 180;
    const Δφ = ((theirLat - myLat) * Math.PI) / 180;
    const Δλ = ((theirLong - myLong) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const bearing = R * c;

    // const bearing = 20;
    setBearing(bearing);

    return bearing;
  };

  const detectIfMobileBrowser = () => {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
    ];

    return toMatch.some((element) => {
      return navigator.userAgent.match(element);
    });
  };

  const getGeolocationData = () => {
    fetch(`/api/talk/${talkId}/get-geolocation`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => {
        setGeolocation(data);
        // need to get updating down to make this move, otherwise, need to pass data through
        calculateBearing(data);
      });
    });
  };

  const pullCompassData = () => {
    fetch(`/api/talk/${talkId}/pull-compass`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => {
        if (initiatorOrJoiner === "initiator") {
          setLinkedCompassDirection(data.joinerCompassDirection);
        } else {
          setLinkedCompassDirection(data.initiatorCompassDirection);
        }
      });
    });
  };

  const pushCompassData = () => {
    if (detectIfMobileBrowser() === false) {
      const compassDirection = 20;
      setMyCompassDirection(compassDirection);
      const postData = {
        compassDirection: compassDirection,
        initiatorOrJoiner: initiatorOrJoiner,
        talkId: talkId,
        userId: userId,
      };

      fetch(`/api/talk/${talkId}/push-compass`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      }).then((response) => console.log(response));
    } else {
      window.addEventListener(
        "deviceorientation",
        (event) => {
          const compassDirection = event.webkitCompassHeading;
          setMyCompassDirection(compassDirection);
          const postData = {
            compassDirection: compassDirection,
            initiatorOrJoiner: initiatorOrJoiner,
            talkId: talkId,
            userId: userId,
          };

          fetch(`/api/talk/${talkId}/push-compass`, {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          }).then((response) => console.log(response));
        },
        { once: true }
      );
    }
  };

  return (
    <div>
      <div>Your unique talk id: {sessionStorage.getItem("talkId")}</div>
      <button onClick={getGeolocationData}>Get Geolocation Data</button>
      <button onClick={pullCompassData}>Pull Compass Data</button>
      <button onClick={pushCompassData}>Push Compass Data</button>
      <button onClick={calculateBearing}>Find Direction!</button>
      {bearing === null ? null : (
        <div>
          <div>Your lovelock bearing: {parseInt(bearing)}</div>
          <div>Your current direction: {myCompassDirection}</div>
          <div>Your partner's compass direction: {linkedCompassDirection}</div>
        </div>
      )}
    </div>
  );
}
