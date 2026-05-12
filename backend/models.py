import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from enum import Enum


class EpisodeStatus(str, Enum):
    draft = "draft"
    ready = "ready"
    exported = "exported"


class Episode(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str = Field(default="Sans titre")
    description: str = Field(default="")
    hashtags: list = Field(default_factory=list, sa_column=Column(JSON))
    status: EpisodeStatus = Field(default=EpisodeStatus.draft)
    audio_path: Optional[str] = Field(default=None)
    cover_path: Optional[str] = Field(default=None)
    thumbnail_path: Optional[str] = Field(default=None)
    duration_sec: Optional[float] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    exports: list = Field(default_factory=list, sa_column=Column(JSON))


class EpisodeCreate(SQLModel):
    title: str = "Sans titre"


class EpisodeUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    hashtags: Optional[list] = None
    status: Optional[EpisodeStatus] = None
    cover_path: Optional[str] = None
    thumbnail_path: Optional[str] = None


class EpisodeRead(SQLModel):
    id: str
    title: str
    description: str
    hashtags: list
    status: EpisodeStatus
    audio_path: Optional[str]
    cover_path: Optional[str]
    thumbnail_path: Optional[str]
    duration_sec: Optional[float]
    created_at: datetime
    updated_at: datetime
    exports: list
