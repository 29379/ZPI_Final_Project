package pwr.zpibackend.models.university;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import pwr.zpibackend.models.Student;

import javax.persistence.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity(name = "student_program_cycle")
public class StudentProgramCycle {

    @EmbeddedId
    private StudentProgramCycleId id;

    @ManyToOne
    @MapsId("studentMail")
    @JoinColumn(name = "student_mail")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Student student;

    @ManyToOne
    @MapsId("programId")
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne
    @MapsId("cycleId")
    @JoinColumn(name = "cycle_id")
    private StudyCycle cycle;
}