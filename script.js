let invalidLinks = [];

async function checkInvites() {
    const inviteInput = document.getElementById("inviteInput");
    const rawInvites = inviteInput.value.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (rawInvites.length === 0) {
        alert("Please enter at least one invite link.");
        return;
    }

    // Reset UI
    document.getElementById("validInvites").innerHTML = '';
    document.getElementById("invalidInvites").innerHTML = '';
    document.getElementById("errorInvites").innerHTML = '';
    document.getElementById("stats-dashboard").style.display = 'flex';
    document.getElementById("copyInvalidBtn").style.display = 'none';
    invalidLinks = [];

    // Reset Stats
    let total = rawInvites.length;
    let checked = 0;
    let valid = 0;
    let invalid = 0;

    updateStats(total, checked, valid, invalid);

    for (const inviteLink of rawInvites) {
        // Handle trailing slashes and extract code
        const cleanLink = inviteLink.replace(/\/+$/, '');
        const inviteCode = cleanLink.split('/').pop();
        
        try {
            const response = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`);
            
            // Handle Rate Limiting (429) explicitly if needed, but slow processing helps prevent it.
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? (parseFloat(retryAfter) * 1000) : 2000;
                await new Promise(r => setTimeout(r, waitTime));
                // Retry logic could be added here, but for now we just wait extra and mark as error/invalid or let the user re-run.
                // For simple "slow down", we just continue to next logic which might fail this one but save the rest.
                // Actually, let's just wait generic delay + extra.
            }

            const data = await response.json();

            if (response.ok) {
                valid++;
                renderValidInvite(data, inviteLink);
            } else {
                invalid++;
                invalidLinks.push(inviteLink);
                renderInvalidInvite(inviteLink, data.message || "Unknown Error");
            }
        } catch (error) {
            invalid++; // Treat errors as invalid for stats or separate if needed
            invalidLinks.push(inviteLink);
            renderErrorInvite(inviteLink, error.message);
        }

        checked++;
        updateStats(total, checked, valid, invalid);

        // Add a delay to prevent rate limiting and improve accuracy
        await new Promise(r => setTimeout(r, 1000)); // 1 second delay
    }

    if (invalidLinks.length > 0) {
        document.getElementById("copyInvalidBtn").style.display = 'block';
    }
}

function updateStats(total, checked, valid, invalid) {
    document.getElementById("stat-entered").innerText = total;
    document.getElementById("stat-checked").innerText = checked;
    document.getElementById("stat-valid").innerText = valid;
    document.getElementById("stat-invalid").innerText = invalid;
}

function copyInvalidInvites() {
    if (invalidLinks.length === 0) return;
    
    const textToCopy = invalidLinks.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.getElementById("copyInvalidBtn");
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        setTimeout(() => {
            btn.innerText = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function renderValidInvite(data, originalLink) {
    const container = document.getElementById("validInvites");
    const item = document.createElement("div");
    item.classList.add("invite-item", "valid");

    const iconUrl = data.guild.icon 
        ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    item.innerHTML = `
        <div class="invite-header">
            <img src="${iconUrl}" class="invite-icon" alt="Server Icon">
            <span class="invite-name">${data.guild.name}</span>
        </div>
        <div class="invite-details">
            ID: ${data.guild.id} | Members: ${data.presence_count || "N/A"} | Active: ${data.approximate_presence_count || "N/A"}
        </div>
        <div class="invite-details">
            <a href="${originalLink}" target="_blank" style="color: #00b0f4;">${originalLink}</a>
        </div>
    `;
    container.appendChild(item);
}

function renderInvalidInvite(link, reason) {
    const container = document.getElementById("invalidInvites");
    const item = document.createElement("div");
    item.classList.add("invite-item", "invalid");
    
    item.innerHTML = `
        <div class="invite-header">
            <span class="invite-name">Invalid</span>
        </div>
        <div class="invite-details">
            Link: ${link}
        </div>
        <div class="invite-details" style="color: #f04747;">
            Reason: ${reason}
        </div>
    `;
    container.appendChild(item);
}


/* Mode Switcher Logic */
function switchMode(mode) {
    // Buttons
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Content Areas
    if (mode === 'bulk') {
        document.getElementById('bulk-mode').style.display = 'block';
        document.getElementById('single-mode').style.display = 'none';
        buttons[0].classList.add('active');
    } else {
        document.getElementById('bulk-mode').style.display = 'none';
        document.getElementById('single-mode').style.display = 'block';
        buttons[1].classList.add('active');
    }
}

/* Single Mode Logic */
async function checkSingleInvite() {
    const input = document.getElementById('singleInviteInput');
    const container = document.getElementById('single-result-container');
    const inviteLink = input.value.trim();

    if (!inviteLink) {
        alert("Please enter an invite link.");
        return;
    }

    container.innerHTML = '<div style="color: #b9bbbe; text-align: center;">Checking...</div>';

    // Handle trailing slashes and extract code
    const cleanLink = inviteLink.replace(/\/+$/, '');
    const inviteCode = cleanLink.split('/').pop();

    try {
        const response = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true&with_expiration=true`);
        const data = await response.json();

        if (response.ok) {
            renderSingleInviteCard(data, inviteLink);
        } else {
            container.innerHTML = `<div style="color: #ed4245; text-align: center; font-size: 18px; margin-top: 20px;">Invalid Invite: ${data.message}</div>`;
        }
    } catch (error) {
        container.innerHTML = `<div style="color: #ed4245; text-align: center; font-size: 18px; margin-top: 20px;">Error: ${error.message}</div>`;
    }
}

function renderSingleInviteCard(data, originalLink) {
    const container = document.getElementById('single-result-container');
    const guild = data.guild;
    const channel = data.channel;
    const inviter = data.inviter;

    const bannerUrl = guild.banner 
        ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=600`
        : null;
    
    const iconUrl = guild.icon 
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const headerImageStyle = bannerUrl ? `background-image: url('${bannerUrl}');` : 'background-color: #202225;';

    // Features
    const featuresHtml = guild.features && guild.features.length > 0 
        ? guild.features.map(f => `<span class="feature-tag">${f.replace(/_/g, ' ')}</span>`).join('') 
        : '<span style="color: #72767d; font-style: italic;">No specific features found</span>';

    // Safely handle missing data (e.g. inviter)
    const inviterName = inviter ? `${inviter.username}#${inviter.discriminator}` : 'N/A';
    const expiration = data.expires_at ? new Date(data.expires_at).toLocaleString() : 'Never';

    const html = `
    <div class="single-invite-card">
        <div class="card-header-image" style="${headerImageStyle}"></div>
        <div class="card-header-content">
            <img src="${iconUrl}" class="single-server-icon" alt="Icon">
            <h2 class="single-server-name">${guild.name}</h2>
            <div class="single-server-desc">${guild.description || "No description available."}</div>
        </div>
        
        <div class="details-grid">
            <div class="detail-item">
                <span class="detail-label">Guild ID</span>
                <span class="detail-value">${guild.id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Members</span>
                <span class="detail-value" style="color: #43b581;">● ${data.presence_count || 0} Online</span> / <span style="color: #b9bbbe;">${data.approximate_member_count || 0} Total</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Channel</span>
                <span class="detail-value">#${channel.name} (${channel.type === 0 ? 'Text' : 'Voice'})</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Inviter</span>
                <span class="detail-value">${inviterName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Expires At</span>
                <span class="detail-value">${expiration}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">NSFW Level</span>
                <span class="detail-value">${guild.nsfw_level}</span>
            </div>
        </div>

        <div class="server-features">
            <div style="margin-bottom: 10px; font-weight: bold; color: #b9bbbe; font-size: 12px; text-transform: uppercase;">Server Features</div>
            ${featuresHtml}
        </div>

        <div class="json-actions">
            <button class="copy-json-btn" onclick="copySingleJSON(${JSON.stringify(JSON.stringify(data)).replace(/"/g, '&quot;')})">Copy Full JSON</button>
        </div>
    </div>
    `;

    container.innerHTML = html;
}

function copySingleJSON(jsonStr) {
    navigator.clipboard.writeText(jsonStr).then(() => {
        alert("JSON copied to clipboard!");
    });
}
