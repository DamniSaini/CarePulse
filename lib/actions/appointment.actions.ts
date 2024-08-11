"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";




import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";

export const createAppointment = async (
    appointment: CreateAppointmentParams
  ) => {
    try {
      const newAppointment = await databases.createDocument(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        ID.unique(),
        appointment
      );
  
      
      return parseStringify(newAppointment);
    } catch (error) {
      console.error("An error occurred while creating a new appointment:", error);
    }
  };

  export const getAppointment = async (appointmentId: string) => {
    try {
      if(!appointmentId){
        console.error('appointment id is missing.');
        return null;
      }
      const appointment = await databases.getDocument(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        appointmentId
      );
  
      return parseStringify(appointment);
    } catch (error) {
      console.error(
        "An error occurred while retrieving the existing patient:",
        error
      );
    }
  };

  export const getRecentAppointmentList = async () => {
    try {
      const appointments = await databases.listDocuments(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        [Query.orderDesc("$createdAt")]
      );
  
  
      const initialCounts = {
        scheduledCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
      };
  
      const counts = (appointments.documents as Appointment[]).reduce((acc, appointment) => {
         if(appointment.status === 'scheduled') {
          acc.scheduledCount += 1;
         }else if (appointment.status === 'pending'){
          acc.pendingCount += 1;
        }else if(appointment.status === 'cancelled'){
          acc.cancelledCount += 1;
        }
        return acc;
        },
        initialCounts
      );
  
      const data = {
        totalCount: appointments.total,
        ...counts,
        documents: appointments.documents,
      };
  
      return parseStringify(data);
    } catch (error) {
      console.error(
        "An error occurred while retrieving the recent appointments:",
        error
      );
    }
  };

  export const updateAppointment = async ({
    appointmentId,
    userId,
    timeZone,
    appointment,
    type,
  }: UpdateAppointmentParams) => {
    try {
      // Update appointment to scheduled -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#updateDocument
      const updatedAppointment = await databases.updateDocument(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        appointmentId,
        appointment
      );
  
      if (!updatedAppointment) throw Error;

      
      revalidatePath('/admin');
      return parseStringify(updatedAppointment)
      
    } catch (error) {
      console.log(error)
    }
  }


