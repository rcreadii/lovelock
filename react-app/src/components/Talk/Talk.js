import React, { useState } from "react";

import Arrow from "../Arrow/Arrow";

export default function Talk() {
  const [bearing, setBearing] = useState(null);
  const [KMDistance, setKMDistance] = useState(null);
  const [geolocation, setGeolocation] = useState();

  const [linkedCompassDirection, setLinkedCompassDirection] = useState();
  const [myCompassDirection, setMyCompassDirection] = useState();

  const [endTheTalk, setEndTheTalk] = useState(false);

  const initiatorOrJoiner = sessionStorage.getItem("initiatorOrJoiner");
  const talkId = sessionStorage.getItem("talkId");
  const userId = sessionStorage.getItem("userId");

  const calculateBearing = (geolocationData) => {
    let myLat;
    let myLong;
    let theirLat;
    let theirLong;

    // why did I have to flip this direction?
    if (initiatorOrJoiner !== "initiator") {
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

    const myLatRad = myLat * (Math.PI / 180);
    const myLongRad = myLong * (Math.PI / 180);
    const theirLatRad = theirLat * (Math.PI / 180);
    const theirLongRad = theirLong * (Math.PI / 180);

    console.log(myLat, myLong, theirLat, theirLong);
    console.log(myLatRad, myLongRad, theirLatRad, theirLongRad);

    const R = 6371e3;
    const φ1 = (myLat * Math.PI) / 180;
    const φ2 = (theirLat * Math.PI) / 180;
    const Δφ = ((theirLat - myLat) * Math.PI) / 180;
    const Δλ = ((theirLong - myLong) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInMeters = R * c;

    console.log(distanceInMeters / 1000);

    setKMDistance(distanceInMeters / 1000);

    // pussies are lat
    // walking men are long

    const y = Math.sin(theirLongRad - myLongRad) * Math.cos(theirLatRad);
    const x =
      Math.cos(myLatRad) * Math.sin(theirLatRad) -
      Math.sin(myLatRad) *
        Math.cos(theirLatRad) *
        Math.cos(theirLongRad - myLongRad);
    const theta = Math.atan2(y, x);
    const bearing = ((theta * 180) / Math.PI + 360) % 360;

    console.log(bearing);

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

  const endTalk = () => {
    setEndTheTalk(true);

    setBearing(null);
  };

  const getGeolocationData = () => {
    fetch(`/api/talk/${talkId}/get-geolocation`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      console.log(response);
      response.json().then((data) => {
        setGeolocation(data);
        console.log(data);
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
    getGeolocationData();

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
      window.addEventListener("deviceorientation", (event) => {
        const compassDirection = event.webkitCompassHeading;
        setMyCompassDirection(compassDirection);
        const postData = {
          compassDirection: compassDirection,
          initiatorOrJoiner: initiatorOrJoiner,
          talkId: talkId,
          userId: userId,
        };

        // if (Date.now() % (1000 * 10) === 0) {
        //   console.log(Date.now());
        fetch(`/api/talk/${talkId}/push-compass`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }).then((response) => console.log(response));

        pullCompassData();
      });
      if (endTheTalk) {
        window.removeEventListener("deviceorientation"); // maybe this will work?
      }
    }
  };

  return (
    <div>
      <div>Your unique talk id: {sessionStorage.getItem("talkId")}</div>
      <button onClick={pushCompassData}>Start & Update Talk</button>
      {bearing === null ? null : (
        <div>
          <div>Your lovelock calculated bearing: {parseInt(bearing)}</div>
          <div>Your current direction: {parseInt(myCompassDirection)}</div>
          <div>
            Your partner's compass direction: {parseInt(linkedCompassDirection)}
          </div>
          <Arrow
            bearing={parseInt(bearing)}
            myCompassDirection={myCompassDirection}
          />
        </div>
      )}
      <button onClick={endTalk}>End Talk</button>
    </div>
  );
}