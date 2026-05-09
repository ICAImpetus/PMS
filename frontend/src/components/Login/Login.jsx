// LoginPage.jsx
import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, IconButton, TextField, CssBaseline, Button, MenuItem, InputAdornment, CircularProgress, Avatar } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Visibility, VisibilityOff, DarkMode, LightMode, ArrowBack } from '@mui/icons-material';
import { useMode } from '../../theme';
import { tokens } from '../../theme';
import { postDatatoServer } from '../../utils/services';
import { ThemeProvider } from '@mui/material/styles';
import adminImage from '../../../ICA.webp';
import { UserContextHook } from '../../contexts/UserContexts';
import { toast } from 'react-hot-toast';
import { sendDataApiFunc } from '../../utils/services';
import { normalizeUserType } from '../../utils/normalizeUserType';
import { commonRoutes } from '../../api/apiService';
import { useApi } from '../../api/useApi';
import './CssLogin.css';
// import LANDING_PAGE_URL from meta.env.LANDING_PAGE_URL;

const LANDING_PAGE_URL = import.meta.env.VITE_LANDING_PAGE_URL;

const LoginSchema = Yup.object().shape({
    username: Yup.string().required('Required'),
    password: Yup.string().min(6, 'Too Short!').required('Required'),
    loginType: Yup.string().required('Required'),
});
export default function Login({ setRefresh }) {
    const [theme, colorMode] = useMode();
    const colors = tokens(theme.palette.mode);

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleToggleDarkMode = () => colorMode.toggleColorMode();

    const { request: loginRequest, loading: loginLoading, error: loginError } =
        useApi(commonRoutes.login, { isPublic: true });

    const { login } = UserContextHook()
    const handleLoginSubmit = async (values) => {
        try {


            const { username, password } = values;

            const data = { username, password };

            // postDatatoServer({
            //     end_point: apiUrl,
            //     body: data,
            //     call_back: handleResponse,
            // });
            console.log("data", data);
            const response = await loginRequest(data);
            console.log("currentUser", response);
            localStorage.setItem("token", response?.token)
            login(response?.result)



        } catch (error) {
            console.error("Login failed:", error);
        }
    };


    useEffect(() => {
        if (loginError) {
            toast.error(loginError || "Internal Server Error")
        }
    }, [loginError])
    return (
        // <ThemeProvider theme={theme} >
        // <div className="login-container">


        //     <div className="infinity-background">
        //         <div className="infinity-shape"></div>
        //     </div>
        //     <CssBaseline />
        //     <Container component="main" maxWidth="xs">

        //         <Toaster position="top-right" reverseOrder={false} />
        //         <Box
        //             component="img"
        //             src={adminImage}
        //             alt="Transparent Square"
        //             sx={{
        //                 display: 'block',
        //                 margin: '0 auto',
        //                 width: '50%',
        //                 height: 'auto',
        //                 marginBottom: 2,
        //                 marginTop: 2,
        //             }}
        //         />
        //         <Box
        //             sx={{
        //                 display: 'flex',
        //                 flexDirection: 'column',
        //                 alignItems: 'center',
        //                 padding: 3,
        //                 boxShadow: 3,
        //                 borderRadius: 2,
        //                 bgcolor: colors.primary[900],
        //             }}
        //         >
        //             <IconButton
        //                 onClick={handleToggleDarkMode}
        //                 sx={{ position: 'absolute', top: 16, right: 16 }}
        //             >
        //                 {theme.palette.mode === 'light' ? <LightMode /> : <DarkMode />}
        //             </IconButton>
        //             <Typography component="h1" variant="h5">
        //                 Sign In
        //             </Typography>
        //             <Formik
        //                 initialValues={{ username: '', password: '', loginType: 'Admin' }}
        //                 validationSchema={LoginSchema}
        //                 onSubmit={handleLoginSubmit}
        //             >
        //                 {({ errors, touched }) => (
        //                     <Form>
        //                         <Field
        //                             as={TextField}
        //                             margin="normal"
        //                             fullWidth
        //                             label="Username"
        //                             name="username"
        //                             variant="standard"
        //                             error={touched.username && Boolean(errors.username)}
        //                             helperText={touched.username && errors.username}

        //                         />
        //                         <Field
        //                             as={TextField}
        //                             margin="normal"
        //                             fullWidth
        //                             label="Password"
        //                             name="password"
        //                             type={showPassword ? 'text' : 'password'}
        //                             variant="standard"
        //                             error={touched.password && Boolean(errors.password)}
        //                             helperText={touched.password && errors.password}
        //                             InputProps={{
        //                                 endAdornment: (
        //                                     <InputAdornment position="end">
        //                                         <IconButton
        //                                             onClick={handleClickShowPassword}
        //                                             edge="end"
        //                                             disableRipple
        //                                             disableFocusRipple
        //                                             sx={{ boxShadow: 'none', '&:hover': { backgroundColor: 'transparent' } }}
        //                                         >
        //                                             {showPassword ? <VisibilityOff /> : <Visibility />}
        //                                         </IconButton>
        //                                     </InputAdornment>
        //                                 ),
        //                             }}
        //                         />

        //                         <Button
        //                             disabled={loginLoading}
        //                             type="submit"
        //                             fullWidth
        //                             variant="contained"
        //                             color='secondary'
        //                             sx={{ mt: 3, mb: 2, backgroundColor: colors.orangeAccent?.[700] || "#d63384", '&:hover': { backgroundColor: colors.orangeAccent?.[800] || "#d63384" } }}
        //                         >
        //                             {loginLoading ? <CircularProgress /> : " Sign In"}

        //                         </Button>
        //                     </Form>
        //                 )}
        //             </Formik>
        //         </Box>
        //     </Container>
        // </div>
        //  </ThemeProvider>
        <div className="login-container">
            <div className="infinity-background">
                <div className="infinity-shape"></div>
            </div>

            <div className="login-card animate-fade">
                <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => window.location.href = LANDING_PAGE_URL}
                    style={{
                        position: "absolute",
                        color: 'blue',
                        top: "12px",
                        left: "12px",
                        fontSize: "12px",
                        padding: "1px 2px",
                        zIndex: 10,
                        width: '30px'
                    }}
                >
                    <ArrowBack />
                </button>
                <div className="login-header">


                    <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>

                        <Avatar
                            sx={{
                                width: 68,
                                height: 68,
                                bgcolor: 'transparent',
                                // border: '1px solid',
                                borderColor: 'divider',
                                p: 0.5,
                            }}
                        >
                            <Box
                                component="img"
                                src="/infinisLogoNew.png"
                                alt="Logo"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        </Avatar>


                    </div>
                    <h4 style={{ margin: 0, color: "#2c4c96" }}>Patient Management System</h4>
                    <p className="text-muted">Sign in to your account</p>
                </div>

                <Formik
                    initialValues={{ username: "", password: "", loginType: "Admin" }}
                    validationSchema={LoginSchema}
                    onSubmit={handleLoginSubmit}
                >
                    {({ errors, touched }) => (
                        <Form

                        >

                            {/* Username */}
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <Field
                                    name="username"
                                    type="text"

                                    style={{ color: 'black' }}
                                    className="form-control"
                                    placeholder="Enter your username"
                                />
                                {touched.username && errors.username && (
                                    <div style={{ color: 'red', fontSize: '12px' }}>
                                        {errors.username}
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <label className="form-label">Password</label>

                                <div style={styles.container}>
                                    <Field

                                        style={{ color: 'black' }}
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Enter password"
                                    />

                                    <span onClick={handleClickShowPassword} style={styles.icon}>
                                        {showPassword ?
                                            <VisibilityOff /> : <Visibility />
                                        }
                                    </span>
                                </div>

                                {touched.password && errors.password && (
                                    <div style={{ color: 'red', fontSize: '12px' }}>
                                        {errors.password}
                                    </div>
                                )}
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loginLoading}
                            >
                                {loginLoading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    "Sign In"
                                )}
                            </button>

                        </Form>
                    )}
                </Formik>
            </div>
        </div>

        // <Formik
        //     initialValues={{ username: "", password: "", loginType: "Admin" }}
        //     validationSchema={LoginSchema}
        //     onSubmit={handleLoginSubmit}
        // >
        //     {({ values, handleChange, handleSubmit, errors, touched }) => (
        //         <form onSubmit={handleSubmit}>

        //             <div className="fixed top-0 left-0 w-full h-full bg-white">
        //                 <div className="flex h-screen">

        //                     {/* LEFT */}
        //                     <div className="w-full lg:w-1/2 flex flex-col justify-center px-12 md:px-24">

        //                         <button
        //                             type='button'
        //                             onClick={() => window.location.href = LANDING_PAGE_URL}
        //                             className="mb-12 text-slate-400 hover:text-black text-[10px] tracking-[0.3em] uppercase">
        //                             ← Terminate Handshake
        //                         </button>

        //                         <div className="max-w-sm w-full">
        //                             <h2 className="text-5xl font-bold text-slate-900 mb-2">PMS</h2>
        //                             <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-12">
        //                                 Patient Management System
        //                             </p>

        //                             <div className="space-y-10">

        //                                 {/* USERNAME */}
        //                                 <div className="relative">
        //                                     <label className="text-[9px] font-black uppercase text-slate-300 absolute -top-5">
        //                                         Institutional Identifier
        //                                     </label>
        //                                     <input
        //                                         name="username"
        //                                         value={values.username}
        //                                         onChange={handleChange}
        //                                         className="input-underlined"
        //                                         placeholder="username"
        //                                     />
        //                                     {touched.username && errors.username && (
        //                                         <p className="text-red-500 text-xs mt-1">{errors.username}</p>
        //                                     )}
        //                                 </div>

        //                                 {/* PASSWORD */}
        //                                 <div className="relative flex items-center">
        //                                     <label className="text-[9px] font-black uppercase text-slate-300 absolute -top-5">
        //                                         Authorized Security Key
        //                                     </label>

        //                                     <input
        //                                         name="password"
        //                                         value={values.password}
        //                                         onChange={handleChange}
        //                                         type={showPassword ? "text" : "password"}
        //                                         className="input-underlined w-full"
        //                                         placeholder="••••••••••••"
        //                                     />

        //                                     <span
        //                                         onClick={handleClickShowPassword}
        //                                         className="ml-2 cursor-pointer"
        //                                     >
        //                                         {showPassword ? <VisibilityOff /> : <Visibility />}
        //                                     </span>

        //                                     {touched.password && errors.password && (
        //                                         <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        //                                     )}
        //                                 </div>

        //                                 {/* BUTTON */}
        //                                 <button
        //                                     type="submit"
        //                                     disabled={loginLoading}
        //                                     className="w-full py-5 rounded-lg text-white font-bold text-xs tracking-[0.2em] uppercase transition shadow-xl hover:brightness-110 active:scale-95"
        //                                     style={{ backgroundColor: "#2563EB" }}
        //                                 >
        //                                     {loginLoading ? "Authenticating..." : "Validate Authentication"}
        //                                 </button>

        //                                 <p className="text-center text-[9px] text-slate-300">
        //                                     Session Security: AES-256 Bit Encryption Active
        //                                 </p>

        //                             </div>
        //                         </div>
        //                     </div>

        //                     {/* RIGHT */}
        //                     <div className="hidden lg:flex w-1/2 items-center justify-center bg-blue-600">
        //                         <div className="text-center text-white">
        //                             <img
        //                                 src="/infinisLogoNew.png"
        //                                 alt="Logo"
        //                                 className="h-10 mx-auto mb-8 brightness-0 invert opacity-50"
        //                             />
        //                             <h4 className="text-[10px] font-black tracking-[0.5em] opacity-40 uppercase">
        //                                 Authorized Environment
        //                             </h4>
        //                         </div>
        //                     </div>

        //                 </div>
        //             </div>

        //         </form>
        //     )}
        // </Formik>
    );



}

const styles = {
    container: {
        position: 'relative',
        width: '100%',
        // maxWidth: '300px',
    },
    input: {
        width: '100%',
        padding: '10px 40px 10px 10px',
        border: 'none'
        // fontSize: '16px',
    },
    icon: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        color: '#b2b0b0',
        // fontSize: '18px',
    }
}