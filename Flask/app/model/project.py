class Project:

    def __init__(self, project_id, name, root_directory):
        self._project_id = project_id
        self._name = name
        self._root_directory = root_directory

    @property
    def project_id(self):
        return self._project_id

    @project_id.setter
    def project_id(self, value):
        self._project_id = value

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def root_directory(self):
        return self._root_directory

    @root_directory.setter
    def root_directory(self, value):
        self._root_directory = value