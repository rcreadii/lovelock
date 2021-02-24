from flask import Blueprint, jsonify, request
import requests

from app.models import db, Locale

locale_routes = Blueprint("locale", __name__)


@locale_routes.route("/", methods=["GET"])
def get_locale():
    return "hi"


@locale_routes.route("/", methods=["POST"])
def make_locale():
    json = request.json

    sun_response = requests.get(
        f'https://api.sunrise-sunset.org/json?lat={json["GPSLatitude"]}&lng={json["GPSLongitude"]}'
    )
    sun = sun_response.json()

    sunrise = sun["results"]["sunrise"]
    sunset = sun["results"]["sunset"]

    weather_response = requests.get(
        f'https://api.openweathermap.org/data/2.5/weather?lat={json["GPSLatitude"]}&lon={json["GPSLongitude"]}&units=imperial&appid=f0f94586ed73f88a8afda092075a65a0'
    )
    weather = weather_response.json()

    feels_like = weather["main"]["feels_like"]
    temp = weather["main"]["temp"]
    weatherDescription = weather["weather"][0]["main"]
    weatherDescriptionDetailed = weather["weather"][0]["description"]
    # wind_deg = weather["wind"]["deg"]
    # wind_speed = weather["wind"]["speed"]

    locale = Locale(
        GPSLatitude=json["GPSLatitude"],
        GPSLongitude=json["GPSLongitude"],
        localTimezoneOffset=json["localTimezoneOffset"],
        sunrise=sunrise,
        sunset=sunset,
        temperatureFahrenheit=temp,
        temperatureFeelsLikeFahrenheit=feels_like,
        userId=json["userId"],
        weatherDescription=weatherDescription,
        weatherDescriptionDetailed=weatherDescriptionDetailed,
    )

    db.session.add(locale)
    db.session.commit()

    return jsonify(locale.to_dict())