from sqlalchemy import Column, String, ForeignKey, Enum as SAEnum, UUID, Numeric
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import uuid

class Royalty(Base, TimestampMixin):
    __tablename__ = 'royalties'
    
    royalty_id = Column(UUID, primary_key=True, default=uuid.uuid4)
    right = Column(SAEnum("Master", "Recording", name="royalty_right_enum"), nullable=True)
    royalty = Column(
        SAEnum(
            "Mechanical",
            "Performance",
            "Synchronization",
            "Neighboring",
            "Reproduction",
            "Digital",
            "Physical",
            name="royalty_type_enum",
        ),
        nullable=True,
    )
    platform_id = Column(UUID, ForeignKey("platforms.platform_id"), nullable=True)
    platform = relationship("Platform", back_populates="royalties")
    track_id = Column(UUID, ForeignKey("track.track_id"), nullable=True)
    track = relationship("Track", back_populates="royalties")
    royalty_transactions = relationship("RoyaltyTransaction", back_populates="royalty")

class RoyaltyTransaction(Base, TimestampMixin):
    __tablename__ = 'royalty_transactions'
    
    royalty_transaction_id = Column(UUID, primary_key=True, default=uuid.uuid4)
    amount = Column(Numeric(12, 2), nullable=True)
    currency = Column(String, default="USD", nullable=True)
    royalty_id = Column(UUID, ForeignKey("royalties.royalty_id"), nullable=True)
    royalty = relationship("Royalty", back_populates="royalty_transactions")
    