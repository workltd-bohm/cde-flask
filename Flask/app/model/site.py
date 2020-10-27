class Site:

    def __init__(self, name, description, address, gross_perimeter, gross_area):
        self._name = name
        self._description = description
        self._address = address
        self._gross_perimeter = gross_perimeter
        self._gross_area = gross_area

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    @property
    def address(self):
        return self._address

    @address.setter
    def address(self, value):
        self._address = value

    @property
    def gross_perimeter(self):
        return self._gross_perimeter

    @gross_perimeter.setter
    def gross_perimeter(self, value):
        self._gross_perimeter = value

    @property
    def gross_area(self):
        return self._gross_area

    @gross_area.setter
    def gross_area(self, value):
        self._gross_area = value

    def to_json(self):
        return {
            'name': self._name,
            'description': self._description,
            'address': self._address,
            'gross_perimeter': self._gross_perimeter,
            'gross_area': self._gross_area
        }

    @staticmethod
    def json_to_obj(json_file):
        return Site(
            json_file['name'],
            json_file['description'],
            json_file['address'],
            json_file['gross_perimeter'],
            json_file['gross_area']
        )
