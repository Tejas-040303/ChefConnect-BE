import React from 'react';
import TeamComponent from './TeamComponent'
function Team() {
    return (
        <div className="container">
            <div className="row">
                <div className="col-6">
                    <TeamComponent pngPath="../public/person.jpg" Name="Tejas Pawar" Designation="Team Lead" />
                    </div>
                    <div className="col-6">
                        <TeamComponent pngPath="../public/person.jpg" Name="Athrva" Designation="Backend Lead" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <TeamComponent pngPath="../public/person.jpg" Name="Kanha Padol" Designation="Frontend Lead" />
                    </div>
                    <div className="col-6">
                        <TeamComponent pngPath="../public/person.jpg" Name="Rajnandini" Designation="Desgin Lead" />
                    </div>
                </div>
            </div>
    );
}

export default Team;