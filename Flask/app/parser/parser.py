from typing import Tuple
from app.parser.compliance_rule import *

from app.parser.schema import ComplianceStatus, AttributeType, SegmentLevel
import json


class Parser:
    def segment_mandatory(self, segment_level = 0):
        if segment_level == SegmentLevel.PROJECT.value or segment_level == SegmentLevel.ORIGINATOR.value or segment_level == SegmentLevel.VOLUME_SYSTEM.value or \
            segment_level == SegmentLevel.LEVEL_LOCATION.value or segment_level == SegmentLevel.TYPE.value or segment_level == SegmentLevel.ROLE_DISCIPLINE.value or \
            segment_level == SegmentLevel.NUMBER.value:
            return True
        elif segment_level == SegmentLevel.CLASSIFICATION.value or segment_level == SegmentLevel.SUITABILITY_STATUS.value or \
            segment_level == SegmentLevel.REVISION.value or segment_level == SegmentLevel.DESCRIPTION.value:
            return False

    def get_segment_details(self, segment_count = 0):
        if segment_count == SegmentLevel.PROJECT.value:
            return (AttributeType.project, self.segment_mandatory(segment_count), separator_strict_compliance_rule,
                    separator_loose_compliance_rule,
                    project_strict_compliance_rule, project_loose_compliance_rule)
        elif segment_count == SegmentLevel.ORIGINATOR.value:
            return (AttributeType.originator, self.segment_mandatory(segment_count), separator_strict_compliance_rule,
                    separator_loose_compliance_rule,
                    originator_strict_compliance_rule, originator_loose_compliance_rule)
        elif segment_count == SegmentLevel.VOLUME_SYSTEM.value:
            return (AttributeType.volume_system, self.segment_mandatory(segment_count),
                    separator_strict_compliance_rule,
                    separator_loose_compliance_rule,
                    vol_sys_strict_compliance_rule, vol_sys_loose_compliance_rule)
        elif segment_count == SegmentLevel.LEVEL_LOCATION.value:
            return (AttributeType.level_location, self.segment_mandatory(segment_count),
                    separator_strict_compliance_rule,
                    separator_loose_compliance_rule,
                    lvl_loc_strict_compliance_rule, lvl_loc_loose_compliance_rule)
        elif segment_count == SegmentLevel.TYPE.value:
            return (AttributeType.type, self.segment_mandatory(segment_count), separator_strict_compliance_rule,
                    separator_loose_compliance_rule,
                    type_strict_compliance_rule, type_loose_compliance_rule)
        elif segment_count == SegmentLevel.ROLE_DISCIPLINE.value:
            return (AttributeType.role_discipline, self.segment_mandatory(segment_count),
                    separator_strict_compliance_rule,
                    separator_loose_compliance_rule,
                    role_discipline_strict_compliance_rule, role_discipline_loose_compliance_rule)
        elif segment_count == SegmentLevel.CLASSIFICATION.value:
            return (AttributeType.classification, self.segment_mandatory(segment_count), separator_strict_compliance_rule,
                    classifier_separator_loose_compliance_rule,
                    classification_strict_compliance, classification_loose_compliance_rule)
        elif segment_count == SegmentLevel.NUMBER.value:
            return (AttributeType.number, self.segment_mandatory(segment_count), separator_strict_compliance_rule,
                    separator_loose_compliance_rule,
                    number_strict_compliance_rule, number_strict_compliance_rule)
        elif segment_count == SegmentLevel.SUITABILITY_STATUS.value:
            return (AttributeType.suitability_status, self.segment_mandatory(segment_count),
                    separator_strict_compliance_rule,
                    separator_loose_compliance_rule,
                    suitability_status_strict_compliance_rule, suitability_status_loose_compliance_rule)
        elif segment_count == SegmentLevel.REVISION.value:
            return (AttributeType.revision, self.segment_mandatory(segment_count), separator_strict_compliance_rule,
                    separator_loose_compliance_rule,
                    revision_strict_compliance_rule, revision_loose_compliance_rule)
        elif segment_count == SegmentLevel.DESCRIPTION.value:
            return (AttributeType.description, self.segment_mandatory(segment_count), description_separator_compliance_rule,
                    description_separator_compliance_rule, description_strict_compliance_rule,
                    description_loose_compliance_rule)
        else:
            print("Current level = << OUT OF BOUND >>")
            return AttributeType.not_available, False, None, None, None, None


    def parse_separator(self, comp_rl, leftover_seg) -> Tuple[str, int]:
        if comp_rl is None:
            return None, 0

        match = comp_rl().search(leftover_seg)

        if match is None:
            return None, 0

        return match.group(0), match.start()

    def parse_next_segment(self, project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl = 0):
        result = {}

        attr_type, mandatory_field, sep_st_comp_rl, sep_ls_comp_rl, attr_st_comp_rl, attr_ls_comp_rl = \
            self.get_segment_details(seg_lvl)
        
        

        # Skip to parse classification if previous segments are not all strictly ISO compliant.
        if not is_parent_sep_strict and seg_lvl == 6:
            result["strict"] = {
                "type": attr_type,
                "mandatory": mandatory_field,
                "value": None,
                "status": ComplianceStatus.skip,
                "separator": None,
                "next_segment": self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
            }

            result["loose"] = {
                "type": attr_type,
                "mandatory": mandatory_field,
                "value": None,
                "status": ComplianceStatus.skip,
                "separator": None,
                "next_segment": self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
            }
        else:
            strict_sep, strict_sep_start_pos = self.parse_separator(sep_st_comp_rl, leftover_seg)
            loose_sep, loose_sep_start_pos = self.parse_separator(sep_ls_comp_rl, leftover_seg)

            # handle strict separator compliance case.
            if strict_sep is not None:
                attr = leftover_seg[0:strict_sep_start_pos]
                attr_comp_status = self.parse_attribute_compliance_status(attr_st_comp_rl, attr_ls_comp_rl, extension,
                                                                          attr)
                new_leftover_seg = leftover_seg[strict_sep_start_pos + 1:]

                if seg_lvl < SegmentLevel.DESCRIPTION.value and len(new_leftover_seg) > 0 \
                        and attr_comp_status != ComplianceStatus.non:
                    next_seg = self.parse_next_segment(project_code, company_code, new_leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                # handle project code field case.
                elif seg_lvl == SegmentLevel.PROJECT.value:
                    if new_leftover_seg == project_code:
                        attr = project_code
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = self.parse_next_segment(project_code, company_code, new_leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                    else:
                        attr = project_code
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                # handle originator code field case.
                elif seg_lvl == SegmentLevel.ORIGINATOR.value:
                    if new_leftover_seg == company_code:
                        attr = company_code
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = self.parse_next_segment(project_code, company_code, new_leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                    else:
                        attr = company_code
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                # handle optional field case.
                elif not mandatory_field and attr_comp_status == ComplianceStatus.non:
                    attr = None
                    strict_sep = None
                    attr_comp_status = ComplianceStatus.strict
                    next_seg = self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                else:
                    next_seg = None

                result["strict"] = {
                    "type": attr_type,
                    "mandatory": mandatory_field,
                    "value": attr,
                    "status": attr_comp_status,
                    "separator": strict_sep,
                    "next_segment": next_seg
                }
            # handle strict separator compliance case.

            # handle loose separator compliance case.
            if loose_sep is not None:
                attr = leftover_seg[0:loose_sep_start_pos]
                attr_comp_status = self.parse_attribute_compliance_status(attr_st_comp_rl, attr_ls_comp_rl, extension,
                                                                          attr)
                new_leftover_seg = leftover_seg[loose_sep_start_pos + 1:]

                if (seg_lvl < SegmentLevel.DESCRIPTION.value and len(new_leftover_seg) > 0 \
                        and attr_comp_status != ComplianceStatus.non):
                    next_seg = self.parse_next_segment(project_code, company_code, new_leftover_seg, extension, False, seg_lvl + 1)
                # handle project code field case.
                elif seg_lvl == SegmentLevel.PROJECT.value:
                    if attr == project_code:
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = self.parse_next_segment(project_code, company_code, new_leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                    else:
                        attr = project_code
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                # handle originator code field case.
                elif seg_lvl == SegmentLevel.ORIGINATOR.value:
                    if attr == company_code:
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = self.parse_next_segment(project_code, company_code, new_leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                    else:
                        attr = company_code
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                # handle optional field case.
                elif not mandatory_field and attr_comp_status == ComplianceStatus.non:
                    attr = None
                    loose_sep = None
                    attr_comp_status = ComplianceStatus.strict
                    next_seg = self.parse_next_segment(project_code, company_code, leftover_seg, extension, False, seg_lvl + 1)
                else:
                    next_seg = None

                result["loose"] = {
                    "type": attr_type,
                    "mandatory": mandatory_field,
                    "value": attr,
                    "status": attr_comp_status,
                    "separator": loose_sep,
                    "next_segment": next_seg
                }
            # handle loose separator compliance case.

            # handle none separator compliance case.
            if strict_sep is None and loose_sep is None:
                separator = None
                attr = leftover_seg
                attr_comp_status = self.parse_attribute_compliance_status(attr_st_comp_rl, attr_ls_comp_rl,
                                                                          extension,
                                                                          attr)
                
                # handle project code field case.
                if seg_lvl == SegmentLevel.PROJECT.value:
                    if attr == project_code:
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = None
                    else:
                        attr = project_code
                        attr_comp_status = ComplianceStatus.strict
                        separator = '-'
                        next_seg = self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                # handle originator code field case.
                elif seg_lvl == SegmentLevel.ORIGINATOR.value:
                    if attr == company_code:
                        attr_comp_status = ComplianceStatus.strict
                        next_seg = None
                    else:
                        attr = company_code
                        attr_comp_status = ComplianceStatus.strict
                        separator = '-'
                        next_seg = self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                # handle optional field case.
                elif not mandatory_field and attr_comp_status == ComplianceStatus.non:
                    attr = None
                    attr_comp_status = ComplianceStatus.strict
                    next_seg = self.parse_next_segment(project_code, company_code, leftover_seg, extension, is_parent_sep_strict, seg_lvl + 1)
                else:
                    next_seg = None

                result["non"] = {
                    "type": attr_type,
                    "mandatory": mandatory_field,
                    "value": attr,
                    "status": attr_comp_status,
                    "separator": separator,
                    "next_segment": next_seg
                }
            # handle none separator compliance case.

        return result

    def parse_attribute_compliance_status(self, strict_compliance_rule, loose_compliance_rule, extension,
                                          attribute):
        if strict_compliance_rule(attribute, extension):
            return ComplianceStatus.strict
        elif loose_compliance_rule(attribute, extension):
            return ComplianceStatus.loose
        else:
            return ComplianceStatus.non

    def flatten_segment_tree(self, result_list, prev_cell_arr, segment_lvl, segment):
        if segment is None:
            return

        if "strict" in segment:
            cell_arr_strict = prev_cell_arr.copy()
            cell_arr_strict.extend([segment["strict"]["status"].value, segment["strict"]["value"],
                                    "non" if segment["strict"]["separator"] is None else "strict",
                                    segment["strict"]["separator"]])

            if "next_segment" in segment["strict"] and segment["strict"]["next_segment"] is not None:
                self.flatten_segment_tree(result_list, cell_arr_strict, segment_lvl + 1,
                                          segment["strict"]["next_segment"])
            else:
                result_list.append(cell_arr_strict)

        if "loose" in segment:
            cell_arr_loose = prev_cell_arr.copy()
            cell_arr_loose.extend([segment["loose"]["status"].value, segment["loose"]["value"],
                                   "non" if segment["loose"]["separator"] is None else "loose",
                                   segment["loose"]["separator"]])

            if "next_segment" in segment["loose"] and segment["loose"]["next_segment"] is not None:
                self.flatten_segment_tree(result_list, cell_arr_loose, segment_lvl + 1,
                                          segment["loose"]["next_segment"])
            else:
                result_list.append(cell_arr_loose)

        if "non" in segment:
            cell_arr_non = prev_cell_arr.copy()
            cell_arr_non.extend([segment["non"]["status"].value, segment["non"]["value"],
                                   "non", segment["non"]["separator"]])

            if "next_segment" in segment["non"] and segment["non"]["next_segment"] is not None:
                self.flatten_segment_tree(result_list, cell_arr_non, segment_lvl + 1,
                                          segment["non"]["next_segment"])
            else:
                result_list.append(cell_arr_non)

    def update_suitability_status_revision(self, result_list):
        for i in range(0, len(result_list)):
            # no suitability status
            if len(result_list[i]) < 18:
                continue

            # no revision
            if len(result_list[i]) < 20:
                if result_list[i][16] != "non" and result_list[i][17] is not None:
                    result_list[i][16] = "loose"
                continue

            if (result_list[i][17] is None and result_list[i][19] is None) or (
                    result_list[i][17] is not None and result_list[i][19] is not None):
                result_list[i][16] = "strict"
                result_list[i][18] = "strict"
            else:
                result_list[i][18] = "loose"

    def calculate_mandatory_optional_score(self, result_list):
        SEGMENT_RESULT_GROUP_SIZE = 4
        SCORE_STRICT = 2
        SCORE_LOOSE = 1
        SCORE_NON = 0

        for result_i in range(0, len(result_list)):
            mandatory_score = 0
            optional_score = 0

            for segment_i in range(0, len(result_list[result_i]) // SEGMENT_RESULT_GROUP_SIZE):
                if result_list[result_i][segment_i * SEGMENT_RESULT_GROUP_SIZE + 1] is None:
                    continue
                if result_list[result_i][segment_i * SEGMENT_RESULT_GROUP_SIZE] == ComplianceStatus.strict:
                    score = SCORE_STRICT
                elif result_list[result_i][segment_i * SEGMENT_RESULT_GROUP_SIZE] == ComplianceStatus.loose:
                    score = SCORE_LOOSE
                else:
                    score = SCORE_NON

                if self.segment_mandatory(segment_i):
                    mandatory_score = mandatory_score + score
                else:
                    optional_score = optional_score + score

            result_list[result_i].insert(0, optional_score)
            result_list[result_i].insert(0, mandatory_score)

    def compose_result(self, results, file_extension):
        return_result = {}
        return_result['extension'] = file_extension

        if len(results) == 0:
            return return_result

        sorted_results = sorted(results, key=lambda x: (x[0], x[1]), reverse=True)
        final_result = sorted_results[0]

        if len(final_result) >= 1:
            return_result['mandatory_attribute_score'] = final_result[0]

        if len(final_result) >= 2:
            return_result['optional_attribute_score'] = final_result[1]

        if len(final_result) >= 4 and final_result[2] is not None and final_result[3] is not None:
            return_result['project'] = { 'status': final_result[2], 'value': final_result[3] }

        if len(final_result) >= 6 and final_result[4] is not None and final_result[5] is not None:
            return_result['separator_00'] = { 'status': final_result[4], 'value': final_result[5] }

        if len(final_result) >= 8 and final_result[6] is not None and final_result[7] is not None:
            return_result['originator'] = { 'status': final_result[6], 'value': final_result[7] }

        if len(final_result) >= 10 and final_result[8] is not None and final_result[9] is not None:
            return_result['separator_01'] = { 'status': final_result[8], 'value': final_result[9] }

        if len(final_result) >= 12 and final_result[10] is not None and final_result[11] is not None:
            return_result['volume_system'] = { 'status': final_result[10], 'value': final_result[11] }

        if len(final_result) >= 14 and final_result[12] is not None and final_result[13] is not None:
            return_result['separator_02'] = { 'status': final_result[12], 'value': final_result[13] }

        if len(final_result) >= 16 and final_result[14] is not None and final_result[15] is not None:
            return_result['level_location'] = { 'status': final_result[14], 'value': final_result[15] }

        if len(final_result) >= 18 and final_result[16] is not None and final_result[17] is not None:
            return_result['separator_03'] = { 'status': final_result[16], 'value': final_result[17] }

        if len(final_result) >= 20 and final_result[18] is not None and final_result[19] is not None:
            return_result['type'] = { 'status': final_result[18], 'value': final_result[19] }

        if len(final_result) >= 22 and final_result[20] is not None and final_result[21] is not None:
            return_result['separator_04'] = { 'status': final_result[20], 'value': final_result[21] }

        if len(final_result) >= 24 and final_result[22] is not None and final_result[23] is not None:
            return_result['role_discipline'] = { 'status': final_result[22], 'value': final_result[23] }

        if len(final_result) >= 26 and final_result[24] is not None and final_result[25] is not None:
            return_result['separator_05'] = { 'status': final_result[24], 'value': final_result[25] }

        if len(final_result) >= 28 and final_result[26] is not None and final_result[27] is not None:
            return_result['classification'] = { 'status': final_result[26], 'value': final_result[27] }

        if len(final_result) >= 30 and final_result[28] is not None and final_result[29] is not None:
            return_result['separator_06'] = { 'status': final_result[28], 'value': final_result[29] }

        if len(final_result) >= 32 and final_result[20] is not None and final_result[31] is not None:
            return_result['number'] = { 'status': final_result[30], 'value': final_result[31] }

        if len(final_result) >= 34 and final_result[32] is not None and final_result[33] is not None:
            return_result['separator_07'] = { 'status': final_result[32], 'value': final_result[33] }

        if len(final_result) >= 36 and final_result[34] is not None and final_result[35] is not None:
            return_result['suitability_status'] = { 'status': final_result[34], 'value': final_result[35] }

        if len(final_result) >= 38 and final_result[36] is not None and final_result[37] is not None:
            return_result['separator_08'] = { 'status': final_result[36], 'value': final_result[37] }

        if len(final_result) >= 40 and final_result[38] is not None and final_result[39] is not None:
            return_result['revision'] = { 'status': final_result[38], 'value': final_result[39] }

        if len(final_result) >= 42 and final_result[40] is not None and final_result[41] is not None:
            return_result['separator_09'] = { 'status': final_result[40], 'value': final_result[41] }

        if len(final_result) >= 44 and final_result[42] is not None and final_result[43] is not None:
            return_result['description'] = { 'status': final_result[42], 'value': final_result[43] }

        if len(final_result) >= 46 and final_result[44] is not None and final_result[45] is not None:
            return_result['separator_10'] = { 'status': final_result[44], 'value': final_result[45] }

        return return_result

    def parse(self, project_code, company_code, file_name):
        all_results = []
        deduplicated_results = []

        file_extension = file_name[file_name.rfind(".") + 1:].upper()
        file_name_without_extension = file_name[0:file_name.rfind(".")]

        root_segment = self.parse_next_segment(project_code, company_code, file_name_without_extension, file_extension, True, 0)

        print(f"parse_next_segment = {json.dumps(root_segment, indent=4)}")

        self.flatten_segment_tree(all_results, [], 0, root_segment)

        print(f"flatten_segment_tree = {json.dumps(all_results, indent=4)}")

        self.update_suitability_status_revision(all_results)

        print(f"update_suitability_status_revision = {json.dumps(all_results, indent=4)}")

        self.calculate_mandatory_optional_score(all_results)

        print(f"calculate_mandatory_optional_score = {json.dumps(all_results, indent=4)}")

        [deduplicated_results.append(x) for x in all_results if x not in deduplicated_results]

        print(f"deduplicated_results = {json.dumps(deduplicated_results, indent=4)}")

        result = self.compose_result(deduplicated_results, file_extension)

        return result

# parser = Parser()
# parser.parse(file_name)
