import {configureStore} from "@reduxjs/toolkit"

import AdminSliceReducer from "./Slices/AdminSlice"
import AuthSliceReducer from "./Slices/AuthSlice"
import CourseSliceReducer from "./Slices/CourseSlice"
import LectureSliceReducer from "./Slices/LectureSlice"
import OrderSliceReducer from "./Slices/OrderSlice"
import RazorpaySliceReducer from "./Slices/RazorpaySlice"
import StatSliceReducer from "./Slices/StatSlice"

 const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,
        course: CourseSliceReducer,
        razorpay: RazorpaySliceReducer,
        lecture: LectureSliceReducer,
        stat: StatSliceReducer,
        admin: AdminSliceReducer,
        order: OrderSliceReducer
    },
    devTools: true
})

export default store