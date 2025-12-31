
/**
 * Normalize backend Demand DTO -> UI shape.
 * Handles inconsistent backend keys (e.g., rr vs rrNumber, recieved vs received, etc.)
 */
export function normalizeDemandDto(d = {}) {
  return {
          demandId: d.demandId ?? "",
      rr: (d.rrNumber ?? d.rr ?? "").toString(),
      demandRecievedDate: d.demandReceivedDate ?? d.demandRecievedDate ?? "",
      // buisenessFunction: d.buisenessFunction ?? "",
      podprogrammeName: d.prodProgramName ?? d.podprogrammeName ?? "",
      lob: d.lob ?? "",
      manager: d.hiringManager ?? d.manager ?? "",
      deliveryManager: d.deliveryManager ?? "",
      pmo: d.pmo ?? "",
      pmoSpoc: d.pmoSpoc ?? "",
      pm: d.pm ?? "",
      hbu: d.hbu ?? "",
      skillCluster: d.skillCluter ?? d.skillCluster ?? "",
      primarySkill: d.primarySkills ?? d.primarySkill ?? "",
      secondarySkill: d.secondarySkills ?? d.secondarySkill ?? "",
      experience: d.experience ?? "",
      priority: d.priority ?? "",
      demandLocation: d.demandLocation ?? "",
      salesSpoc: d.salesSpoc ?? "",
      // p1FlagData: d.p1FlagData ?? "",
      priorityComment: d.priorityComment ?? "",
      band: d.band ?? "",
      p1Age: d.p1Age ?? "",
      currentProfileShared: (d.currentProfileShared),
      dateOfProfileShared: d.dateOfProfileShared ?? "",
      externalInternal: d.externalInternal ?? "",
      status: d.status ?? "",
      demandType: d.demandType ?? "",
      demandTimeline: d.demandTimeline ?? "",
      id: d.id, // for backend updates
  };
}