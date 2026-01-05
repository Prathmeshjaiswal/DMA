export function cleanUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

// Build the DTO the backend expects
export function buildUpdateDemandDTO(form) {
  const dto = {
    id: form.id,
    demandId: form.demandId,            
    rrNumber: form.rrNumber,
    lob: form.lob,
    skillCluter: form.skillCluter ?? form.skillCluster,
    skillCluster: form.skillCluter ?? form.skillCluster,

    primarySkills: form.primarySkills,
    secondarySkills: form.secondarySkills,
    demandReceivedDate: form.demandReceivedDate,

    hiringManager: form.hiringManager,
    salesSpoc: form.salesSpoc,
    deliveryManager: form.deliveryManager,
    pmo: form.pmo,
    hbu: form.hbu,
    demandType: form.demandType,

    // Optionals
    prodProgramName: form.prodProgramName,
    experience: form.experience,
    priority: form.priority,
    demandLocation: form.demandLocation,
    priorityComment: form.priorityComment,
    pm: form.pm,
    band: form.band,
    p1Age: form.p1Age,
    currentProfileShared: form.currentProfileShared,
    remark: form.remark,
    demandTimeline: form.demandTimeline,
    externalInternal: form.externalInternal,
    status: form.status,
    pmoSpoc: form.pmoSpoc,
  };

  return cleanUndefined(dto);
}
