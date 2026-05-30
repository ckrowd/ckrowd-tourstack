// AUTO-GENERATED from the "TourStack Workforce & Vendor Directory" taxonomy.
// 110 workforce roles across 11 departments; 94 SME/vendor types across 10 categories.
// Labels live in messages/*.json under "StakeholderTaxonomy". Do not edit by hand.

export const WORKFORCE_DEPARTMENTS = [
	{ key: "production_stage", roles: ["production_manager", "tour_manager", "stage_manager", "assistant_stage_manager", "production_coordinator", "production_assistant", "technical_director", "show_caller", "advance_person", "tour_accountant", "tour_publicist", "venue_liaison", "logistics_coordinator", "travel_coordinator", "security_director", "personal_security_officer", "security_team_member", "runner", "interpreter_translator"] },
	{ key: "audio", roles: ["foh_engineer", "monitor_engineer", "systems_engineer", "rf_coordinator", "playback_technician", "audio_systems_technician", "microphone_technician", "cable_tech", "intercom_comms_tech", "local_audio_crew", "recording_engineer", "audio_crew_chief"] },
	{ key: "lighting_visual", roles: ["lighting_designer", "lighting_director", "lighting_programmer", "head_rigger", "rigger", "lighting_technician", "follow_spot_operator", "video_director", "video_engineer", "camera_operator", "led_tech", "laser_technician"] },
	{ key: "staging_fx", roles: ["set_designer", "scenic_carpenter", "stage_carpenter", "props_master", "stage_crew_loaders", "forklift_operator", "automation_operator", "pyrotechnics_technician", "special_effects_technician"] },
	{ key: "creative_performance", roles: ["musical_director", "bandleader", "session_musician", "backing_vocalist", "dancer", "choreographer", "creative_director", "wardrobe_stylist", "wardrobe_assistant", "hair_stylist", "makeup_artist", "personal_stylist", "vocal_coach", "physical_trainer"] },
	{ key: "artist_talent", roles: ["artist_manager", "tour_booking_agent", "personal_assistant", "artist_relations_manager", "talent_buyer", "entertainment_lawyer", "visa_immigration_specialist", "cultural_liaison", "tour_medic", "nutritionist_chef"] },
	{ key: "backline", roles: ["backline_tech", "guitar_tech", "drum_tech", "keyboard_tech", "bass_tech", "piano_tuner"] },
	{ key: "digital_media", roles: ["tour_photographer", "videographer", "content_creator", "digital_marketing_manager", "livestream_producer", "graphic_designer", "motion_graphics_designer", "press_officer", "radio_plugger"] },
	{ key: "ticketing_ops", roles: ["box_office_manager", "ticketing_platform_operator", "foh_manager", "gate_access_control", "vip_hospitality_coordinator", "crowd_safety_manager", "ushers_floor_staff", "event_cashier"] },
	{ key: "transport_logistics", roles: ["tour_bus_driver", "truck_driver", "flight_coordinator", "private_pilot", "carnet_customs_specialist", "freight_forwarder", "ground_transport_coordinator"] },
	{ key: "merch_retail", roles: ["merchandise_manager", "merch_seller", "merchandise_designer", "inventory_manager"] },
] as const;

export const VENDOR_CATEGORIES = [
	{ key: "av_production", types: ["pa_system_rental", "monitor_system_supplier", "mixing_console_supplier", "lighting_rig_supplier", "led_screen_supplier", "truss_rigging_supplier", "power_distribution_company", "intercom_comms_supplier", "staging_deck_supplier", "special_effects_equipment_supplier", "backline_rental_company", "projection_laser_supplier", "broadcast_equipment_supplier"] },
	{ key: "logistics_freight", types: ["tour_trucking_company", "freight_forwarding_customs", "charter_aviation_company", "airport_ground_handling", "ground_transport_coach", "artist_ground_transport", "warehouse_staging_facility", "forklift_machinery_hire", "shipping_container_logistics", "courier_document_service", "fuel_generator_service", "carnet_ata_provider"] },
	{ key: "venue_infrastructure", types: ["venue_owner_operator", "temporary_structure_company", "fencing_barrier_supplier", "portable_toilet_sanitation", "power_generation_company", "water_supply_company", "signage_wayfinding", "furniture_equipment_hire", "cleaning_waste_management", "construction_build_company"] },
	{ key: "hospitality_catering", types: ["tour_catering_company", "artist_hospitality_rider", "hotel_accommodation_partner", "vip_hospitality_company", "beverage_distributor", "mobile_kitchen_hire", "catering_staffing_agency", "local_restaurant_partner", "ice_cold_chain_supplier"] },
	{ key: "ticketing_tech", types: ["ticketing_platform_provider", "pos_system_provider", "access_control_scanning", "rfid_wristband_supplier", "mobile_money_integration", "streaming_broadcast_tech", "cybersecurity_data_protection", "website_app_developer", "data_analytics_company"] },
	{ key: "marketing_media", types: ["outdoor_advertising", "radio_station_group", "television_media_house", "digital_marketing_agency", "pr_agency_local", "influencer_marketing_agency", "print_production_company", "street_team_agency", "photography_agency", "video_production_company", "streaming_dsp_marketing"] },
	{ key: "merch_retail_vendor", types: ["merchandise_manufacturer", "merch_distributor_seller", "online_merch_store", "custom_apparel_embroidery", "packaging_fulfilment", "popup_retail_infrastructure"] },
	{ key: "security_safety_medical", types: ["event_security_company", "close_protection_agency", "emergency_medical_services", "fire_safety_company", "crowd_safety_consultancy", "drug_detection_screening", "cctv_surveillance_provider", "ohs_consultant"] },
	{ key: "finance_legal_insurance", types: ["tour_finance_provider", "event_insurance_provider", "payment_processing_company", "mobile_money_operator", "entertainment_law_firm", "tour_accountancy_firm", "currency_exchange_fx", "withholding_tax_specialist", "audit_settlement_services"] },
	{ key: "sponsorship_activation", types: ["sponsorship_agency", "brand_activation_company", "ambient_guerrilla_agency", "sampling_promotions_agency", "sponsor_hospitality_provider", "digital_activation_agency", "rights_licensing_agency"] },
] as const;
