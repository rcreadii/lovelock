from datetime import datetime
from .db import db
from .user import User


class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(db.Integer, primary_key=True)
    createdWhen = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    startedWhen = db.Column(db.DateTime)
    endedWhen = db.Column(db.DateTime)
    active = db.Column(db.Boolean, nullable=False, default=False)
    initiatorCompassDirection = db.Column(db.Numeric, nullable=False)
    initiatorGPSLatitude = db.Column(db.Numeric, nullable=False)
    initiatorGPSLongitude = db.Column(db.Numeric, nullable=False)
    initiatorUserId = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    joinerCompassDirection = db.Column(db.Numeric)
    joinerGPSLatitude = db.Column(db.Numeric)
    joinerGPSLongitude = db.Column(db.Numeric)
    joinerUserId = db.Column(db.Integer, db.ForeignKey(User.id))
    midwayGPSLatitude = db.Column(db.Numeric)
    midwayGPSLongitude = db.Column(db.Numeric)
    midwayPointCity = db.Column(db.String(100))
    uniqueIdentifier = db.Column(db.BigInteger, nullable=False)

    initiatorUser = db.relationship(
        "User", foreign_keys=[initiatorUserId], backref="initiator_conversations"
    )
    joinerUser = db.relationship(
        "User", foreign_keys=[joinerUserId], backref="joiner_conversations"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "createdWhen": self.createdWhen,
            "startedWhen": self.startedWhen,
            "endedWhen": self.endedWhen,
            "active": self.active,
            "initiatorCompassDirection": self.initiatorCompassDirection,
            "initiatorGPSLatitude": self.initiatorGPSLatitude,
            "initiatorGPSLongitude": self.initiatorGPSLongitude,
            "initiatorUserId": self.initiatorUserId,
            "joinerCompassDirection": self.joinerCompassDirection,
            "joinerGPSLatitude": self.joinerGPSLatitude,
            "joinerGPSLongitude": self.joinerGPSLongitude,
            "joinerUserId": self.joinerUserId,
            "midwayGPSLatitude": self.midwayGPSLatitude,
            "midwayGPSLongitude": self.midwayGPSLongitude,
            "midwayPointCity": self.midwayPointCity,
            "uniqueIdentifier": self.uniqueIdentifier,
        }
