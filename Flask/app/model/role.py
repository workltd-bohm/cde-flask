from enum import Enum


class Role(Enum):
    ADMIN = 0
    WATCHER = 1
    DEVELOPER = 2
    OWNER = 3


class UserRoles:

    def __init__(self, user_id, project_id, role):
        self._user_id = user_id
        self._project_id = project_id
        self._role = role
