
import Section1 from "./Sections/Section1";
import Section2 from "./Sections/Section2";
import Section3 from "./Sections/Section3";
import Section4 from "./Sections/Section4";
import Section5 from "./Sections/Section5";
import Section6 from "./Sections/Section6";
import Section7 from "./Sections/Section7";

 
export const renderSection = ({ state,dispatch }) => {
    switch (state.currentSection) {
        case 0:
            return <Section1 dispatch={dispatch} data={state.sectionsData[0]} />;
        case 1:
            return <Section2 dispatch={dispatch} data={state.sectionsData[1]} />;
        case 2:
            return <Section3 dispatch={dispatch} data={state.sectionsData[2]} />;
        case 3:
            return <Section4 dispatch={dispatch} data={state.sectionsData[3]} />;
        case 4:
            return <Section5 dispatch={dispatch} data={state.sectionsData[4]} />;
        case 5:
            return <Section6 dispatch={dispatch} data={state.sectionsData[5]} />;
        case 6:
            return <Section7 dispatch={dispatch} data={state.sectionsData[6]} />;
        // case 7:
        //     return <Section8 dispatch={dispatch} data={state.sectionsData[7]} />;
        // case 8:
        //     return <Section9 dispatch={dispatch} data={state.sectionsData[8]} />;
        // case 9:
        //     return <Section10 dispatch={dispatch} data={state.sectionsData[9]} />;
        // case 10:
        //     return <Section11 dispatch={dispatch} data={state.sectionsData[10]} />;
        // case 11:
        //     return <Section12 dispatch={dispatch} data={state.sectionsData[11]} />;
        // case 12:
        //     return <Section13 dispatch={dispatch} data={state.sectionsData[12]} />;
        // case 13:
        //     return <Section14 dispatch={dispatch} data={state.sectionsData[13]} />;
        // case 14:
        //     return <Section15 dispatch={dispatch} data={state.sectionsData[14]} />;
        // case 15:
        //     return <Section16 dispatch={dispatch} data={state.sectionsData[15]} />;
        // case 16:
        //     return <Section17 dispatch={dispatch} data={state.sectionsData[16]} />;
        // case 17:
        //     return <Section18 dispatch={dispatch} data={state.sectionsData[17]} />;
        // case 18:
        //     return <Section19 dispatch={dispatch} data={state.sectionsData[18]} />;
        // case 19:
        //     return <Section20 dispatch={dispatch} data={state.sectionsData[19]} />;
        // case 20:
        //     return <Section21 dispatch={dispatch} data={state.sectionsData[20]} />;
        // case 21:
        //     return <Section22 dispatch={dispatch} data={state.sectionsData[21]} />;
        // case 22:
        //     return <Section23 dispatch={dispatch} data={state.sectionsData[22]} />;
        // case 23:
        //     return <Section24 dispatch={dispatch} data={state.sectionsData[23]} />;
        default:
            return <div>Form Completed!</div>;
    }
};