import re

def project_strict_compliance_rule(field, extension):
    return re.fullmatch("[A-Z0-9]{2,6}", field) is not None


def project_loose_compliance_rule(field, extension):
    return re.fullmatch("[\x20-\x2C\x2E-\x7E]{1,64}", field) is not None


def originator_strict_compliance_rule(field, extension):
    return re.fullmatch("[A-Z0-9]{3,6}", field) is not None


def originator_loose_compliance_rule(field, extension):
    return re.fullmatch("[\x20-\x2C\x2E-\x7E]{1,64}", field) is not None


def vol_sys_strict_compliance_rule(field, extension):
    return field in ["ZZ", "XX"]
    # TODO: A_Z0-9{2} and if the code is stored in project settings of the relevant project.


def vol_sys_loose_compliance_rule(field, extension):
    return re.fullmatch("[\x20-\x2C\x2E-\x7E]{1,64}", field) is not None


def lvl_loc_strict_compliance_rule(field, extension):
    return field in ["ZZ", "XX", "00", "01", "02", "M1", "M2", "B1", "B2"]
    # TODO: A_Z0-9{2} and if the code is stored in project settings of the relevant project.


def lvl_loc_loose_compliance_rule(field, extension):
    return re.fullmatch("[\x20-\x2C\x2E-\x7E]{1,64}", field) is not None


def type_strict_compliance_rule(field, extension):
    return field in ["BQ", "CA", "CM", "CO", "CP", "CR", "DB", "DR", "FN", "HS", "IE", "M2", "M3", "MI", "MR", "PP",
                     "PR", "RD", "RI", "RP", "SA", "SH", "SN", "SP", "SU", "VS"]
    # TODO: A_Z0-9{2} and if the code is stored in project settings of the relevant project.


def type_loose_compliance_rule(field, extension):
    if re.fullmatch("[\x20-\x2C\x2E-\x7E]{1,64}", field) is None:
        return False

    if extension in ["DWG", "DXF", "AI", "SVG"]:
        return field not in ["M2", "M3", "MR"]
    elif extension in ["PDF", "DWF", "PS"]:
        return field in ["M2", "M3", "MR"]
    elif extension in ["RVT", "PLN", "IRC"]:
        return field != "M3"
    elif extension in ["BIMX", "TM", "DATASMITH", "3DS", "OBJ", "FBX", "BLEND"]:
        return field != "MR"
    elif extension in ["XLS", "XLSX", "CSV", "ODS", "FODS"]:
        return field not in ["FN", "SH", "BQ", "PR"]
    elif extension in ["JPG", "JPEG", "PNG", "BMP", "TIFF", "TIF", "CR2", "NEF", "RAW", "DNG", "PSD"]:
        return field not in ["VS", "IM"]
    elif extension in ["PPT", "PPTX", "KEYNOTE", "ODP", "FODP"]:
        return field != "PP"
    elif extension in ["INDD", "DOCX", "DOC", "ODT", "FODT", "ODG"]:
        return field in ["DR", "M2", "M3", "MR"]
    else:
        return False


def classification_strict_compliance(field, extension):
    return False


def classification_loose_compliance_rule(field, extension):
    return re.fullmatch("Ss[_0-90-9]+", field) is not None


def number_strict_compliance_rule(field, extension):
    return re.fullmatch("[0-9]{4,10}", field) is not None


def number_loose_compliance_rule(field, extension):
    return re.fullmatch("[\x20-\x2C\x2E-\x7E]{1,64}", field) is not None


def suitability_status_strict_compliance_rule(field, extension):
    return field in ["CR", "S0", "S1", "S2", "S3", "S4", "S6", "S7",
                     "A1", "A2", "A3", "A4", "A5", "A6", "A7",
                     "B1", "B2", "B3", "B4", "B5", "B6", "B7"]


# TODO: do not know how to handle to check "does not contain revision".
def suitability_status_loose_compliance_rule(field, extension):
    return field.strip().upper() in ["CR", "S0", "S1", "S2", "S3", "S4", "S6", "S7",
                                     "A1", "A2", "A3", "A4", "A5", "A6", "A7",
                                     "B1", "B2", "B3", "B4", "B5", "B6", "B7"]


def revision_strict_compliance_rule(field, extension):
    return re.fullmatch("[PC][0-9]{2}\\.*[0-9]{0,2}", field) is not None


def revision_loose_compliance_rule(field, extension):
    return re.fullmatch("[PC][0-9]{2}\\.*[0-9]{0,2}", field.strip().upper()) is not None


def description_strict_compliance_rule(field, extension):
    return re.fullmatch("[\x20-\x7E]+", field) is not None


def description_loose_compliance_rule(field, extension):
    return True


def role_discipline_strict_compliance_rule(field, extension):
    return re.fullmatch("[A-Z]{1}", field) is not None
    # TODO: A_Z{1,2} or if the code is stored in project settings of the relevant project.


def role_discipline_loose_compliance_rule(field, extension):
    return False


def separator_strict_compliance_rule():
    return re.compile("-")


def separator_loose_compliance_rule():
    return re.compile("_| +")


def classifier_separator_loose_compliance_rule():
    return re.compile(" +")


def description_separator_compliance_rule():
    return re.compile("\\.")
