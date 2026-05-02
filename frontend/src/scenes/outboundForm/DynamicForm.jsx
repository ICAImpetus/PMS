import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Button, Box, useTheme, Typography } from '@mui/material';
import { tokens } from '../../theme';
// import { renderField } from './renderField';
import { renderField } from './RenderFieldNew';
import { useReducer } from 'react';
import { getDynamicFieldNameAndID } from './utilityFunctions';
import { processString } from '../global/processStringFunc';
import { sendDataApiFunc } from '../../utils/services';
import { Toaster, toast } from 'react-hot-toast';

const initialState = {
    currentSectionId: 1, // Start with the first section
    formData: {}, // Store form data
    history: [],// Store navigation history
};

const formReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.name]: action.value,
                    history: [...state.history, state.currentSectionId], // Push the current section to the history
                },
            };
        case 'UPDATE_SECTION':
            return {
                ...state,
                history: [...state.history, state.currentSectionId], // Add current section to history
                currentSectionId: action.sectionId,
            };
        case 'GO_BACK_SECTION':
            return {
                ...state,
                currentSectionId: state.history[state.history.length - 1], // Pop the last section from history
                history: state.history.slice(0, -1), // Remove the last section from history
            };
        case 'UPDATE_DYNAMIC_FIELD':
            return {
                ...state,
                dynamicField: action.dynamicField,
                dynamicFieldSectionID: action.dynamicFieldSectionID,
            };
        case 'RESET_FORM':
            return initialState;
        // case 'SET_DATA':
        //     return {
        //        ...state,
        //         formData: action.data,
        //     };
        default:
            return state;
    }
};

const DynamicForm = ({ schema }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isSubmitButton, setIsSubmitButton] = useState(false);
    const [errors, setErrors] = useState({});
    const [errorFields, setErrorFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const { dynamicFieldSectionID, dynamicFieldName } = getDynamicFieldNameAndID(null, null, schema);

    // console.log("dynamicFieldSectionID :", dynamicFieldSectionID);
    // console.log("dynamicFieldName :", dynamicFieldName);
    let initialStateAfter;
    // * adding dynamic field key in global state 
    // * because it will be needed for finding the value of 
    // * next section when field is dynamic
    if (dynamicFieldName && dynamicFieldSectionID) {
        initialStateAfter = {
            ...initialState,
            dynamicField: dynamicFieldName,
            dynamicFieldSectionID,
        };
    } else {
        initialStateAfter = initialState;
    }
    // console.log(dynamicFieldInSchema);
    // console.log(initialStateAfter);
    const [state, dispatch] = useReducer(formReducer, initialStateAfter);
    // console.log("state: " , state);

    useEffect(() => {
        // console.log("useEffect");
        // console.log(state);
        if (state.dynamicFieldSectionID >= state.currentSectionId) {
            console.log("Current section ID is greater than or equal to dynamic field section ID");
            return;
        }

        const dyamemicSection = schema.sections.find(section => section.id === state.currentSectionId && section.isDynamicSection === true);
        // console.log("dyamemic section in useeffect:", dyamemicSection);
        // console.log("and current section id is :", state.currentSectionId);
        if (dyamemicSection) {
            const dynamicSectionFieldName = schema.sections.find(section => section.id === state.currentSectionId).fields.find(field => field.isDynamicOption === true)?.name;
            const dynamicSectionId = state.currentSectionId;
            // * updating the dynamic field key in global state
            dispatch({
                type: 'UPDATE_DYNAMIC_FIELD',
                dynamicField: dynamicSectionFieldName, // Replace with the actual value
                dynamicFieldSectionID: dynamicSectionId, // Replace with the actual section ID
            });

        }
    }, [state.currentSectionId]);

    useEffect(() => {
        const nextSection = schema.sections.find(section => section.id === state.currentSectionId)?.nextSection;
        if (!isSubmitButton) {
            if (nextSection === "submit") {
                setIsSubmitButton(true);
            } else {
                setIsSubmitButton(false);
            }
        } else {
            setIsSubmitButton(false);
        }

    }, [state.currentSectionId]);


    const handleFormFieldSet = (field) => {
        const formFields = errorFields.filter(x => x !== field);
        setErrorFields([field, ...formFields]);
    }

    const handleChange = (name, value) => {
        // console.log(name, ":", value);
        dispatch({ type: 'UPDATE_FIELD', name, value });
    };


    // const handlePrevious = () => {
    //     const currentIndex = schema.sections.findIndex(
    //         (section) => section.id === state.currentSectionId
    //     );

    //     if (currentIndex > 0) {
    //         const previousSectionId = schema.sections[currentIndex - 1].id;
    //         dispatch({ type: 'UPDATE_SECTION', sectionId: previousSectionId });
    //     } else {
    //         console.log("Already at the first section.");
    //     }
    // };

    const handleSubmit = async () => {
        setLoading(true);
        console.log("Submitting form:", state.formData);
        const { history, ...formDataActual } = state.formData;
        // Perform API call or further processing with state.formData
        try {
            const response = await sendDataApiFunc("submitFormFilled", formDataActual, 'post');
            if (response.success) {
                // Reset the form
                // dispatch({ type: 'UPDATE_SECTION', sectionId: 1 });
                // dispatch({ type: 'GO_BACK_SECTION' });
                dispatch({ type: 'RESET_FORM' });
                setIsSubmitButton(false);
                toast.success("Form submitted successfully");
                setLoading(false);
            } else {
                console.error("Failed to submit form:", response.message);
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to submit form", error);
            setLoading(false);
        }


    };
    const handlePrevious = () => {
        if (state.history.length > 0) {
            dispatch({ type: 'GO_BACK_SECTION' });
        } else {
            console.log("Already at the first section.");
        }
    };


    const handleNext = () => {
        const currentSectionId = state.currentSectionId;
        const currentSection = schema.sections.find(
            (section) => section.id === currentSectionId
        );



        if (!currentSection) {
            console.error(`Section with ID ${currentSectionId} not found`);
            return;
        }

        // Validate the fields in the current section
        const newErrors = {};
        currentSection.fields.forEach(field => {
            if (field.required && !state.formData[field.name]) {
                newErrors[field.name] = `${field.label} is required`;
            }
        });
        console.log(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});


        const selectedOption = currentSection.fields.find(
            // (field) => field.isDynamicOption === 'true'
            (field) => field.isDynamicOption === true
        );
        const dynamicField = state.dynamicField;
        // console.log("dynamicField :", dynamicField);
        // console.log(currentSectionId);
        // console.log("Option with ID ", selectedOption);
        //* commented out it because it returns undefined when object is found and the key nextSection is not defined in found object
        //* because it is using ternery operator or optional chaining So we will need to use "Nullish Coalescing Operator (??)""
        //? const nextSectionId = selectedOption
        //?     ? selectedOption.options.find(
        //?         (option) => option.value === state.formData.option
        //?    )?.nextSection
        //?     : currentSectionId + 1; // Default to next section ID +1 if undefined
        // * using Nullish Coalescing Operator (??) to avoid undefined behaviour when nextSection is not defined in found object
        // const nextSectionId = selectedOption
        //     ? (selectedOption.options.find(option => option.value === state.formData[dynamicField])?.nextSection ?? currentSectionId + 1)
        //     : currentSectionId + 1;
        // console.log(nextSectionId);
        const nextSectionId = (() => {
            // Check if a selected option exists and has a valid nextSection key
            if (selectedOption) {
                const nextSectionFromOption = selectedOption.options.find(
                    (option) => option.value === state.formData[dynamicField]
                )?.nextSection;
                console.log(state.formData);
                console.log(state.formData[dynamicField]);
                console.log("nextSectionFromOption", nextSectionFromOption);

                if (nextSectionFromOption !== undefined) {
                    return processString(nextSectionFromOption);
                }
            }



            // Check the current section's nextSection key
            if (currentSection?.nextSection) {
                if (currentSection.nextSection === "next") {
                    return currentSectionId + 1;
                } else if (typeof currentSection.nextSection === "number") {
                    return currentSection.nextSection;
                } else if (currentSection.nextSection === "submit") {
                    return "submit";
                }
            }

            // Default case: increment the current section ID
            return currentSectionId + 1;
        })();

        console.log("nextSectionId: ", nextSectionId);


        if (schema.sections.some(section => section.id === nextSectionId)) {
            dispatch({ type: 'UPDATE_SECTION', sectionId: nextSectionId });
        } else {
            // Handle form submission or end-of-form logic here
            // console.log('in else block in handleNext');
            if (nextSectionId === "next") {
                console.log("nextSectionId is next");
                dispatch({ type: 'UPDATE_SECTION', sectionId: currentSectionId + 1 });
            } else if (nextSectionId === "submit") {
                setIsSubmitButton(true);
            } else {
                console.log('Form data:', state.formData);
            }
        }
    };

    const currentSection = schema.sections.find(
        (section) => section.id === state.currentSectionId
    );
    console.log(currentSection)

    return (
        <Box
            sx={{
                // margin: 3, // Adds margin to all sides
                padding: 3, // Adds padding inside the box
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                backgroundColor: colors.primary[800],
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxHeight: '70vh', // Sets the maximum height for the Box
                overflow: "auto", // Enables scrolling when content exceeds maxHeight
                width: "100%", // Takes the full width of the parent container
                maxWidth: "100vw", // Ensures it doesn't exceed the viewport width
                "@media (min-width: 600px)": {
                    maxWidth: "400px", // Limit width for larger screens (e.g., tablets in landscape mode)
                },
                // Centering styles
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)", // Centers the box
                // Custom scrollbar styles
                "&::-webkit-scrollbar": {
                    width: "8px", // Set width for vertical scrollbar
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "transparent", // Make the scrollbar thumb transparent
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: "transparent", // Make the scrollbar track transparent
                },
            }}
        >



            {/* Display section title if it exists */}
            {currentSection?.title && (
                <Typography
                    variant="h5"
                    sx={{
                        // marginBottom: 2, // Space below the title
                        color: colors.primary[500], // Title color
                        fontWeight: 'bold', // Bold title text
                        textAlign: 'center', // Centers the text horizontally
                    }}
                >
                    {currentSection.title}
                </Typography>
            )}

            {/* {currentSection?.fields.map((field) => renderField(field, handleChange, state.formData))} */}
            {currentSection?.fields.map((field, index) =>
                renderField(field, index, handleChange, state.formData, errors)
            )}

            {/* Display the navigation buttons */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between", // Align button to the right
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    size="small" // Small size button
                    onClick={handlePrevious}
                    disabled={state.formData.currentSectionId === schema.sections[0]?.id} // Disable if it's the first section
                >
                    Previous
                </Button>
                {isSubmitButton
                    ?
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        size="small"
                    >
                        Submit
                    </Button>
                    :
                    <Button
                        variant="contained"
                        color="primary"
                        size="small" // Small size button
                        onClick={handleNext}
                    // disabled={!formData.option} // Ensure an option is selected before proceeding
                    >
                        Next
                    </Button>
                }
            </Box>
        </Box>


    );
};

export default DynamicForm;