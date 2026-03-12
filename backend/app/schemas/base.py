from pydantic import BaseModel, ConfigDict


class SchemaBase(BaseModel):
    """Base schema with ORM compatibility enabled."""

    model_config = ConfigDict(from_attributes=True)
