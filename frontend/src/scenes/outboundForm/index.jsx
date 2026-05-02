import React, { useState, useEffect } from 'react';
import DynamicForm from './DynamicForm.jsx';
import dynamicFormData from './dynamicFormData.json';
import { formDataObject } from './DynamicForm';
import { newFormDataArray } from './DynamicForm';
import { Box, Button } from '@mui/material';
import Header from '../../components/Header';
import { getDataFunc } from '../../utils/services';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import EditDynamicForm from '../edit-form';
import { UserContextHook } from '../../contexts/UserContexts';

function OutboundBound({ formTitle, setIsTable }) {
    const { currentUser } = UserContextHook();
    console.log('currrent user', currentUser.isadmin);  
    const isAdmin = currentUser?.isadmin;
    // console.log('dynamicFormData:', dynamicFormData);
    const [editForm, setEditForm] = useState(false);
    if (!formTitle) {
        setIsTable(true);
        return null;
    }
    const [data, setData] = useState(null);
    const Navigate = useNavigate();
    const handleButtonClick = () => {
        console.log('Edit Form');
        // Navigate('/edit-form');
        setEditForm(true);
    }

    const handleClose = () => {
        setEditForm(false);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getDataFunc(`getDataWithFormTitle/${formTitle}`);
                if (response.success) {
                    const data = response.data;
                    setData(data);
                } else {
                    console.log(response.message);
                }
            } catch (error) {
                console.log("Error fetching data: " + error.message);
            }
        };
        fetchData();
    }, []);
    
    const headerSubtitle = `Dynamic ${formDataObject.formTitle}`

    return (
        <Box
            sx={{
                padding: 3,
                // backgroundColor: 'background.default', 
                borderRadius: 2,
                // boxShadow: 1
            }}
        >
            {/* <h1>Dynamic Form Example</h1> */}

            <Toaster position="top-right" reverseOrder={false} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>

                {/* <Header
                    title={formDataObject.formTitle}
                    subtitle={headerSubtitle}
                /> */}
                <Button variant="contained" onClick={handleButtonClick} disabled={!isAdmin}>
                    Edit Form
                </Button>
            </Box>
            {/* <DynamicForm schema={dynamicFormData} /> */}
            {/* <DynamicForm schema={formDataObject} /> */}

            {data && !editForm && <DynamicForm schema={data} />}
            {data && editForm && <EditDynamicForm data={data} handleClose={handleClose} />}
        </Box>
    );
}

export default OutboundBound
