from enum import Enum


class SegmentLevel(Enum):
    PROJECT = 0
    ORIGINATOR = 1
    VOLUME_SYSTEM = 2
    LEVEL_LOCATION = 3
    TYPE = 4
    ROLE_DISCIPLINE = 5
    CLASSIFICATION = 6
    NUMBER = 7
    SUITABILITY_STATUS = 8
    REVISION = 9
    DESCRIPTION = 10


class ComplianceStatus(str, Enum):
    strict = "strict"
    loose = "loose"
    non = "non",
    skip = "skip"


class AttributeType(str, Enum):
    project = "project"
    originator = "originator"
    volume_system = "volume/system"
    level_location = "level/location"
    type = "type"
    role_discipline = "role/discipline"
    classification = "classification"
    number = "number"
    suitability_status = "suitability_status"
    revision = "revision"
    description = "description"
    not_available = "not_available"
