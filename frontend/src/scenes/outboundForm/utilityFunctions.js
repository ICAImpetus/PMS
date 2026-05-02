
export const getDynamicFieldNameAndID = (id, dynamicField, schema) => {
    let dynamicFieldSectionID;
    let dynamicFieldName;
    console.log('getDynamicFieldNameAndID called');
    if (!id && !dynamicField) {
        const dynamicFieldSectionInSchema = schema.sections.find(section => section.isDynamicSection === true);
        console.log("dynamicFieldSectionInSchema :", dynamicFieldSectionInSchema);
        // dynamicFieldName = dynamicFieldSectionInSchema?.fields.find(field => field.isDynamicOption === 'true').name;
        dynamicFieldName = dynamicFieldSectionInSchema?.fields.find(field => field.isDynamicField === true)?.name;
        // console.log("dynamicFieldName :", dynamicFieldName);
        dynamicFieldSectionID = dynamicFieldSectionInSchema?.id;
        console.log("dynamicFieldSectionID :", dynamicFieldSectionID);
        console.log("dynamicFieldName :", dynamicFieldName);
    } else {
        dynamicFieldSectionID = id;
        // dynamicFieldName = schema.sections.find(s => s.id === dynamicFieldSectionID)?.fields.find(f => f.isDynamicOption === 'true')?.name;
        dynamicFieldName = schema.sections.find(s => s.id === dynamicFieldSectionID)?.fields.find(f => f.isDynamicOption === true)?.name;
        // console.log("dynamicFieldName :", dynamicFieldName);
        // console.log("dynamicFieldSectionID :", dynamicFieldSectionID);
    }
    // console.log("dynamicFieldSectionID :", dynamicFieldSectionID);

    return { dynamicFieldSectionID, dynamicFieldName };
}

export const getSectionTitle = (schema, currentSectionId) => {
    const section = schema.sections.find(section => section.id === currentSectionId);
    const title = section.formTitle || "NA";
    return title;
}