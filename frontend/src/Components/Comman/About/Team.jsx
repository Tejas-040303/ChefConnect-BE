import React from 'react';
import TeamComponent from './TeamComponent';
import tejas from '../../../assets/tejas.png';
import kanha from '../../../assets/kanha.png';
import athrav from '../../../assets/Athrav.png';
import rajnandini from '../../../assets/rajnandini.png';

function Team() {
  return (
    <section className="py-12 bg-orange-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-orange-500 text-center mb-12">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          <TeamComponent pngPath={tejas} Name="Tejas Pawar" Designation="Team Lead" />
          <TeamComponent pngPath={athrav} Name="Athrva" Designation="Backend Lead" />
          <TeamComponent pngPath={kanha} Name="Kanha Padol" Designation="Frontend Lead" />
          <TeamComponent pngPath={rajnandini} Name="Rajnandini" Designation="Design Lead" />
        </div>
      </div>
    </section>
  );
}

export default Team;